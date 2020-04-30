const rebaTools = require("reba-tools");
const error = require("./error");
const selector = rebaTools.selector;

const astObj = require("reba-parser-tools");
const astConfig = require("reba-parser-tools").config;

const type = rebaTools.type;
const operator = type.operator;
const brackets = type.brackets;
const jsKey = type.jsKey;

module.exports = class {

    constructor(astI) {
        this.astInformation = astI;
        this.error = new error(astI);
        this.isComment = false;
    }
    /**
     * 用于改变 isComment to true
     */
    changeCommentToTrue() {
        this.isComment = true;
    }
    /**
     * 用于改变 isComment to false
     */
    changeCommentToFalse() {
        this.isComment = false;
    }
    /**
     * 注解分析
     */
    addComment() {
        if (this.isComment) {
            this.astInformation.removeNotes();
            this.changeCommentToFalse();
        }
        this.astInformation.lengthAddOne();
    }
    /**
     * const let var 开头的语法树分析
     */
    variableKeyAna(parentNode) {
        const ast = new astObj.VariableDeclaration(this.astInformation.getNowTokenType());
        this.astInformation.lengthAddOne();
        this.error.nowTokenTypeError(type.variableName);
        ast.declarations.push(this.variableAna(ast));
        while (this.astInformation.isType(operator.sequenceOperator.comma)) {
            this.astInformation.lengthAddOne();
            this.error.nowTokenTypeError(type.variableName);
            ast.declarations.push(this.variableAna(ast));
        }
        this.astInformation.ifSemicolonlengthAddOne();
        return ast;

    }
    /**
     * 用于分析表达式
     * @param {父节点} parentNode 
     */
    expressionAna(parentNode) {
        
    }
    /**
     * 以变量开始的语法树分析
     * @param {语法树父节点} parentNode 
     */
    variableAna(parentNode) {
        let ast = null;
        const that = this;
        switch (parentNode.type) {
            // 当父元素是 const let var 时
            // 当父类为 VariableDeclaration 
            case astConfig.VariableDeclaration:
                ast = new astObj.VariableDeclarator(this.astInformation.getNowTokenLexeme());
                this.astInformation.lengthAddOne();

                if (!this.astInformation.isType(operator.assignmentOperator.equal)) {
                    this.error.tokenTypeArrayError([jsKey.var, jsKey.let], parentNode.kind);
                } else {
                    this.astInformation.lengthAddOne();
                    ast.init = this.expressionAna(ast);
                }
                break;
            // 当其父元素是一个对象的时候
            case astConfig.ObjectExpression:
                ast = this.propertyAna(parentNode);
                break;
            case astConfig.ArrayExpression:
                ast = this.expressionAna(parentNode);
                break;
            default:
                ast = new astObj.ExpressionStatement();
                this.astInformation.lengthAddOne();
                const selector = selector(this);

                selector.push(operator.assignmentOperator.equal,[()=>{
                    that.astInformation.lengthAddOne();
                },"expressionAna"]).
                push(brackets.middlebrackets.leftMiddlebrackets,"").run(this.astInformation.getNowTokenType(),[ast]);

        }
        return ast;
    }
    /**
     * 数组或对象的成员处理
     * @param {父节点} parentNode 
     */
    memberAna(parentNode) {
        const select = new selector(this);
        const that = this;
        // 对象成员处理
        let object = null;
        if (type.isType(parentNode.type, astConfig.MemberExpression) || 
            type.isType(parentNode.type, astConfig.ThisExpression) ) {
            object = parentNode;
        } else {
            object = new astObj.Identifier(this.astInformation.getAheadTokenLexeme());
        }
        // 当接下来的数据为空 或者 类型不为 variableName 报错
        this.error.tokenAddOneAndUndefinedError();
        this.error.nowTokenTypeError(type.variableName);

        let property = this.astInformation.getNowTokenLexeme();

        let ast = new astObj.MemberExpression(property, object);
        this.astInformation.lengthAddOne();

        const data = select.push(operator.memberOperator.spot, "memberAna").
            push(brackets.parentheses.leftParentheses, "callAna").
            push(type.semicolon, () => {
                that.astInformation.lengthAddOne();
            }).run(this.astInformation.getNowTokenType(), [ast]);

        return data ? data : ast;
    }
    /**
     * 用于调用函数处理
     * @param {父节点} parentNode 
     */
    callAna(parentNode) {
        let ast = new astObj.CallExpression(this.astInformation.getAheadTokenLexeme());
        if (type.isType(parentNode.type, astConfig.MemberExpression)) {
            ast.callee = parentNode;
        }
        ast.arguments = this.arguments(ast);
        return ast;
    }

    /**
     * 数组或方法成员
     * @param {*} parentNode 
     */
    arguments(parentNode) {
        let els = [];
        this.error.tokenAddOneAndUndefinedError();
        while (!this.astInformation.isType(brackets.middlebrackets.rightMiddlebrackets)
            && !this.astInformation.isType(brackets.parentheses.rightParentheses)) {
            if (this.astInformation.isType(operator.sequenceOperator.comma)) {
                els.push(null);
                this.astInformation.lengthAddOne();
            } else {
                els.push(this.foundationTypeSelection(parentNode));
            }
        }
        this.astInformation.lengthAddOne();

        return els;
    }

    /**
     * 处理数组
     * @param {父节点} parentNode 
     */
    arrayAna(parentNode) {
        let ast = new astObj.ArrayExpression();
        ast.elements = this.arguments(ast);

        // 数组暴露在最外成包装
        if (type.isType(parentNode.type, astConfig.Program)) {
            let ex = new astObj.ExpressionStatement();
            ex.expression = ast;
            ast = ex;
        }
        return ast;
    }
    /**
     * 公用基础类型选择程序
     */
    foundationTypeSelection(parentNode) {
        const that = this;
        const select = new selector(this);
        return select.push([type.characterString, type.number], () => {

            that.astInformation.lengthAddOne();
            return new astObj.Literal(this.astInformation.getAheadTokenLexeme());
        
        }).push(jsKey.function, "functionAna").
            push(type.variableName, "variableAna").
            push(brackets.braces.leftBraces, "objectAna").
            pushDefaultRun(() => {
                that.error.syntaxError();
            }).run(this.astInformation.getNowTokenType(), [parentNode])
    }
    /**
     * 处理对象里面的数据
     * @param {父节点} parentNode 
     */
    propertyAna(parentNode) {
        const key = this.astInformation.getNowTokenLexeme();
        const property = new astObj.Property(key);
        this.astInformation.lengthAddOne();
        const select =new selector(this);
        const that = this;
        
        property.value = select.push(operator.conditionalOperator.colon,"foundationTypeSelection",()=>{
            that.error.tokenAddOneAndUndefinedError();
        }).push(operator.sequenceOperator.comma,()=>{
            this.astInformation.lengthAddOne();
            return new astObj.Identifier(key);
        }).push(brackets.braces.rightBraces, ()=>{
            return new astObj.Identifier(key);
        }).pushDefaultRun(()=>{
            this.error.syntaxError();
        }).run(this.astInformation.getNowTokenType(), [property]);
        return property;
    }
    /**
     * 分析对象
     * @param {父节点} parentNode 
     */
    objectAna(parentNode) {
        const ast = new astObj.ObjectExpression();
        ast.properties = this.blockAna(ast);
        return ast;
    }

    /**
     * 用于处理方法中的初始值
     * @param {父节点} parentNode 
     */
    assignmentAna(parentNode) {

    }
    /**
     * 分析 this 
     * @param {父节点} parentNode 
     */
    thisAna(parentNode) {
        let ast = new astObj.ThisExpression();
        this.astInformation.lengthAddOne();

        const select = new selector(this);
        const data = select.push(operator.memberOperator.spot,"memberAna").
            run(this.astInformation.getNowTokenType(), [ast]);
        if(type.isType(parentNode.type, astConfig.Program)) {
            const ex  = new astObj.ExpressionStatement();
            if(data) {
                ex.expression = data;
            } else {
                ex.expression = ast;
            }
            ast = ex;
        }
        return ast;
    }
    /**
     * 用于处理箭头函数
     * @param {父节点}} parentNode 
     */
    arrowFunctionAna(parentNode) {

        let ast = null;
        if (type.isType(parentNode.type, astConfig.ExpressionStatement) ||
            type.isType(parentNode.type, astConfig.Property)) {
            ast = new astObj.ArrowFunctionExpression([new astObj.Identifier(this.astInformation.getAheadTokenLexeme())]);
        }
        this.astInformation.lengthAddOne();
        if (this.astInformation.isType(type.brackets.braces.leftBraces)) {
            ast.body = this.blockStatementAna(ast);
        }

        return ast;
    }
    /**
     * 用于处理函数
     * @param {父节点}} parentNode 
     */
    functionAna(parentNode) {
        let ast = null;
        let id = null;
        let params = [];

        switch (this.error.undefinedError(this.astInformation.getNowTokenType())) {
            case jsKey.function:
                this.astInformation.lengthAddOne();
                // token是否必须是 variableName
                if (!this.astInformation.isType(type.variableName)) {

                    this.error.tokenTypeArrayError([
                        astConfig.VariableDeclarator,
                        astConfig.ExpressionStatement,
                        astConfig.Property
                    ], parentNode.type);

                } else if (this.astInformation.isType(type.variableName)) {
                    id = this.astInformation.getNowTokenLexeme();
                    this.astInformation.lengthAddOne();
                }
                params = this.functionParamsAna();
                break;
        }
        switch (parentNode.type) {
            case astConfig.Property:
            case astConfig.VariableDeclarator:
            case astConfig.ExpressionStatement:
                ast = new astObj.FunctionExpression(id, params);
                break;
            default:
                ast = new astObj.FunctionDeclaration(id, params);
        }

        this.error.nowTokenTypeError(brackets.braces.leftBraces);
        // 程序块中分析
        ast.body = this.blockStatementAna(ast);

        this.astInformation.ifSemicolonlengthAddOne();

        return ast;
    }

    /**
     * 方块语句分析
     * @param {父节点} parentNode 
     */
    blockStatementAna(parentNode) {
        let ast = new astObj.BlockStatement();
        ast.body = this.blockAna(parentNode);
        return ast;
    }
    /**
     * 块状结构里面的类容分析
     * @param {父节点} parentNode
     */
    blockAna(parentNode) {

        this.astInformation.lengthAddOne();
        const select = new selector(this);
        const that = this;
        let element = [];
        while (!this.astInformation.isType(brackets.braces.rightBraces)) {
            
            const data = select.push([jsKey.var, jsKey.const, jsKey.let], "variableKeyAna").
            push(jsKey.function, "functionAna").
            push(type.variableName, "variableAna").pushDefaultRun(()=>{
                if (that.astInformation.isType(operator.sequenceOperator.comma)) 
                    that.astInformation.lengthAddOne();
            }).run(this.astInformation.getNowTokenType(), [parentNode]);
            if (data) element.push(data);
        }
        this.astInformation.lengthAddOne();

        return element;
    }
    /**
     * 用于提取函数里面的参数
     * (param1,param2,...params)
     */
    functionParamsAna() {
        const params = [];

        this.error.nowTokenTypeError(brackets.parentheses.leftParentheses);

        this.astInformation.lengthAddOne();

        while (!this.astInformation.isType(brackets.parentheses.rightParentheses)) {
            // 判断是否为 ...
            if (this.astInformation.isType(type.spread)) {
                // token 向后加一位
                this.astInformation.lengthAddOne();
                // token 类型不是 variableName 报错
                this.error.nowTokenTypeError(type.variableName);
                // 添加 token 到 params
                params.push(new astObj.RestElement(this.astInformation.getNowTokenLexeme()));
                // token向后移动
                this.astInformation.lengthAddOne();
                // 判断如果不是 ) 报错
                this.error.nowTokenTypeError(brackets.parentheses.rightParentheses);
            } else {
                // 如果类型不是 variableName 报错
                this.error.nowTokenTypeError(type.variableName);
                // 添加 token 到 params
                params.push(new astObj.Identifier(this.astInformation.getNowTokenLexeme()));
                // token 向后移动
                this.astInformation.lengthAddOne();
                // 如果既不是 ) 又不是 , 报错
                this.error.nowTokenTypeArrayError([
                    brackets.parentheses.rightParentheses,
                    operator.sequenceOperator.comma
                ]);
                // 如果是 , token向后移动
                if (type.isSequenceOperator(this.astInformation.getNowTokenType())) this.astInformation.lengthAddOne();
            }
        }
        this.astInformation.lengthAddOne();
        return params;
    }

}