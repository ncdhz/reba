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
    /**
     * 
     * @param {语法树信息存储类} astI 
     */
    constructor(astI) {
        this.astI = astI;
        this.error = new error(astI);
    }

    /**
     * 构建 ExpressionStatement 对象并向下找到合适的分析函数
     */
    rootNode(parentNode) {
        const ast = new astObj.ExpressionStatement();
        const select = new selector(this);
        ast.expression = select.push(this.selectExpressionArray(),"expressionAna").
            push(type.variableName,"expressionAna").
        run(this.astI.getNowTokenType(),[ast]);
        return ast;
    }

    /**
     * 用于处理 const var let
     * @param {父节点} parentNode 
     */
    variableKeyAna(parentNode){
        let ast = new astObj.VariableDeclaration(this.astI.getNowTokenType());
        this.error.tokenAddOneAndUndefinedError();
        this.error.nowTokenTypeError(type.variableName);
        /**
         * 一个类型有可能有多个变量
         * let x, y
         */
        ast.declarations = this.variableKeyDeclarationsAna(ast);
        return ast;
    }

    variableKeyDeclarationsAna(parentNode) {
        const declarations = [];
        const select = new selector(this);
        /**
         * 判断当为 等号时向等号分析器分发
         * 当为 ， 号时说明这是一个另一个同类型元素，直接调用分析器
         */
        select.push(operator.assignmentOperator.equal, (ast) => {
            this.error.tokenAddOneAndUndefinedError();
            return this.equalAna(ast);
        }).push(operator.sequenceOperator.comma, () => {
                /**
                 * 当前token向前加一 没有token报错
                 * 加一后的token type 不为 variableName 报错
                 */
                this.error.tokenAddOneAndUndefinedError();
                this.error.nowTokenTypeError(type.variableName);
                this.variableKeyDeclarationsAna(parentNode);
            });

        do{
            if (this.astI.isType(operator.sequenceOperator.comma)) 
                this.error.tokenAddOneAndUndefinedError();
            const declarator = new astObj.VariableDeclarator(this.astI.getNowTokenLexeme());
            declarations.push(declarator);
            this.astI.lengthAddOne();
            declarator.init = select.run(this.astI.getNowTokenType(),[declarator]);
            // 箭头函数初始化
            if(type.isType(this.astI.getNowTokenType(), type.arrowFunction)) {
                declarator.init = this.arrowFunctionAna(declarator.init);
            }
            if (!declarator.init&&type.isType(parentNode.kind,jsKey.const)) this.error.syntaxError(); 
        } while (this.astI.isType(operator.sequenceOperator.comma));
        return declarations;
    }

    variableNameAna(parentNode) {
        // 当选择器没有选中时默认调用的方法
        const defaultAna = () => {
            // 当是赋值token 交给赋值分析器分析
            if (type.isAssignmentOperator(this.astI.getBehindTokenType())) {
                return this.equalAna(parentNode);
            }
            let ast = this.returnIdentifierAna();
            if (type.isType(this.astI.getNowTokenType(), [
                operator.updateOperator.reduceOne,
                operator.updateOperator.addOne
            ])) {
                ast = this.updateAna(ast, false);
            }
            return ast;
        }
        // 构建选择器 用于分类处理
        const select = new selector(this);
        // 当后面跟着 .
        return select.push(operator.memberOperator.spot,"objMemberAna").
            // 当后面跟着 [
            push(brackets.middlebrackets.leftMiddlebrackets, "arrMemberAna").
            // 当后面跟着 (
            push(brackets.parentheses.leftParentheses,"callAna").
            push(type.arrowFunction, "arrowFunctionAna").
            // 其他
            pushDefaultRun(defaultAna).
            run(this.astI.getBehindTokenType(),[parentNode]);
    }
    
    /**
     * 用于处理箭头函数初始化的值
     * @param {父节点} parentNode 
     */
    inputArrowFunctionAna(parentNode){
        const select =new selector(this);
        select.push(astConfig.ExpressionStatement,()=>{
            if (type.isType(parentNode.expression.type, astConfig.AssignmentExpression)) {
                parentNode.expression.right = this.arrowFunctionAna(parentNode.expression.right);
            } else if (type.isType(parentNode.expression.type, astConfig.SequenceExpression)) {
                parentNode.expression = this.arrowFunctionAna(parentNode.expression);
            } 
        }).
        run(parentNode.type);
        return parentNode;
    }
    /**
     * 
     * @param {箭头函数处理} parentNode 
     */
    arrowFunctionAna(parentNode) {
        // 对箭头函数中的参数处理
        const formatParam =  (element)=>{
            if (type.isType(element.type, astConfig.ObjectExpression)) {
                const properties = element.properties;
                this.objectPatternConstraint(properties);
                element = new astObj.ObjectPattern();
                element.properties = properties;
            }
            if (type.isType(element.type, astConfig.ArrayExpression)) {
                const elements = element.elements;
                this.arrayPatternConstraint(elements);
                element = new astObj.ArrayPattern();
                element.elements = elements;
            }
            return this.assignmentExpressionToPattern(element);
        }
        /**
         * 当节点为SpreadElement时把他转换为 
         * @param {节点} element 
         */
        const spreadToRest = (element)=>{
            if (type.isType(element.type, astConfig.SpreadElement)) {
                if (type.isType(astConfig.BinaryExpression, element.argument.type)) 
                    this.error.syntaxError();
                return new astObj.RestElement(formatParam(element.argument));
            }
            return element;
        }
        const ast = new astObj.ArrowFunctionExpression();
        if(type.isType(parentNode.type,astConfig.SequenceExpression)) {
            const expressions = parentNode.expressions;
            /**
             * 用于对参数中的数组和对象进行处理
             * 
             */
            for (let index = 0; index < expressions.length; index++) {
                let element = expressions[index];
                element = expressions[index] = formatParam(element);
                expressions[index] = spreadToRest(element);
            }
            ast.params = expressions;
        } else if(!this.astI.isType(type.arrowFunction)) {
            ast.params.push(this.returnIdentifierAna());
        } else {
            let element = formatParam(parentNode);
            element = spreadToRest(element);
            ast.params.push(element);
        } 

        this.astI.lengthAddOne();

        if(this.astI.isType(brackets.braces.leftBraces)) {
            ast.body = this.blockAna(ast);
        } else {
            ast.body = this.expressionAna(ast);
        }
        return ast;
    }
    /**
     * 交给序列分析器时进行的预处理
     * @param {数据} node
     */
    inputSequenceAna(node){
        if (type.isType(node.type, astConfig.ExpressionStatement)) {
            node.expression = this.sequenceAna(node.expression);
        } else {
            return this.sequenceAna(data);
        }
        return node;
    }
    /**
     * 序列处理
     * @param {父节点} node
     */
    sequenceAna(node){
        // 当, 前面没有数据时报语法错误
        if(!node) this.astI.syntaxError();
        let ast = new astObj.SequenceExpression();
        ast.expressions.push(node);
        do{
            // 当为 , 时token向后移动且后面必须有可用的token
            if (this.astI.isType(operator.sequenceOperator.comma)){
                this.error.tokenAddOneAndUndefinedError();
            }
            ast.expressions.push(this.expressionAna(ast));
        } while (this.astI.isType(operator.sequenceOperator.comma) && 
        !type.isType(this.astI.getFrontTokenType(), brackets.parentheses.rightParentheses));
        return ast;
    }
    /**
     * 对象成员分析
     * @param {父节点} parentNode 
     */
    objMemberAna(parentNode) {
        let object = null;
        if (type.isType(parentNode.type, astConfig.MemberExpression)) {
            object = parentNode;
        } else {
            object = this.returnIdentifierAna();
        }
        this.error.tokenAddOneAndUndefinedError();
        if(!this.astI.isType(type.variableName)&&!type.isParent(this.astI.getNowTokenType(),jsKey)) {
            this.error.syntaxError();
        }
        const property = this.returnIdentifierAna();
        const ast = new astObj.MemberExpression(property, object);

        const select = new selector(this);
        const data = select.push(brackets.parentheses.leftParentheses,"callAna").
            push(operator.memberOperator.spot, "objMemberAna").run(this.astI.getNowTokenType(), [ast]);
        
        return data ? data: ast;

    }
    /**
     * 函数成员分析器
     * @param {父节点} parentNode 
     */
    arrMemberAna(parentNode) {
        const object = this.returnIdentifierAna();
        const ast = new astObj.MemberExpression(null,object);
        this.astI.lengthAddOne();
        const data = this.expressionAna(ast);
        if (this.astI.isType(operator.sequenceOperator.comma)) {
            ast.property = this.sequenceAna(data);
        } else {
            ast.property = data;
        }
        this.astI.lengthAddOne();
        return ast;
    }
    /**
     * 对象中的方法分析
     * @param {父节点} parentNode 
     */
    callAna(parentNode) {
        let ast = null;
        if (type.isType(parentNode.type, astConfig.MemberExpression)) {
            ast = new astObj.CallExpression(parentNode);
        } else {
            ast = new astObj.CallExpression(this.returnIdentifierAna());
        }
        this.error.tokenAddOneAndUndefinedError();

        if(!this.astI.isType(brackets.parentheses.rightParentheses)) {
            ast.arguments = this.callParamAna(ast)
        }
        if(this.astI.isType(brackets.parentheses.rightParentheses)) this.astI.lengthAddOne();
        return ast;
    }

    
    /**
     * 对象中赋值分析
     * @param {父节点} parentNode 
     */
    equalAna(parentNode){
        if (type.isType(parentNode.type, astConfig.VariableDeclarator)) {
            // 交给选择器处理
            return this.expressionAna(parentNode);
        }
        const ast = new astObj.AssignmentExpression();
        ast.left = new astObj.Identifier(this.astI.getNowTokenLexeme());
        this.astI.lengthAddOne();
        ast.operator = this.astI.getNowTokenLexeme();
        this.error.tokenAddOneAndUndefinedError();
        
        if(type.isAssignmentOperator(this.astI.getBehindTokenType())) {
            ast.right = this.equalAna(parentNode);
        }else {
            ast.right = this.expressionAna(parentNode);
            // 当前一个字符为 ( 时，token标记符向前移动一位。
            if(type.isType(brackets.parentheses.rightParentheses,this.astI.getFrontTokenType())) {
                this.astI.lengthReduceOne()
            }
        }
        return ast;

    }
    /**
     * 分配表达式转换为分配模式
     * 主要运用在函数中
     */
    assignmentExpressionToPattern(node){
        if(type.isType(node.type, astConfig.AssignmentExpression)) {
            if (node.operator !== "="){
                this.error.syntaxError();
            }
            node = new astObj.AssignmentPattern(node.left,node.right);
        }
        return node;
    }
    /**
     * 用于分析对象
     * @param {父节点} parentNode 
     */
    objectAna(parentNode){
        // 去掉 {
        this.error.tokenAddOneAndUndefinedError();
        let ast = null;
        if (type.isType(parentNode.type, [astConfig.FunctionDeclaration,
            astConfig.FunctionExpression])) {
            ast = new astObj.ObjectPattern();
        }
        else {
            ast= new astObj.ObjectExpression();
        }
        if(!this.astI.isType(brackets.braces.rightBraces)) {
            ast.properties = this.objPropertyAna(ast);
            // 当父类为 function 对参数进行检查
            if (type.isType(parentNode.type, [astConfig.FunctionDeclaration,
                astConfig.FunctionExpression])) {
                this.objectPatternConstraint(ast.properties);
            }
        }
        this.astI.lengthAddOne();
        return ast;
    }
    /**
     * 用于判断函数参数中拥的对象约束
     */
    objectPatternConstraint(properties){
        const params = [];
        // 当 properties 中元素的key和value不是Identifier报语法错误
        for (let index = 0; index < properties.length; index++) {
            const element = properties[index];
            if (!type.isType(element.key.type, [astConfig.Identifier, astConfig.Literal]) ||
                !type.isType(element.value.type, astConfig.Identifier) || 
                params.indexOf(element.key.name) !== -1)
                this.error.syntaxError();

            params.push(element.key.name);
        }
    }
    /**
     * 对象参数分析
     * @param {父节点} parentNode 
     */
    objPropertyAna(parentNode){
        const properties = [];
        const selectKey = new selector(this);
        this.selectLiteral(selectKey).push(type.variableName,"returnIdentifierAna").

        pushDefaultRun(()=>{
            if(type.isParent(this.astI.getNowTokenType(), jsKey)) {
                this.error.tokenAddOneAndUndefinedError();
                return new astObj.Identifier(this.astI.getFrontTokenLexeme());
            }else {
                this.error.syntaxError();
            }
        });
        // 获取分析器
        const selectValue = this.getSelectorTwo();
        selectValue.push(brackets.parentheses.leftParentheses, "functionAna");

        do {
            const ast = new astObj.Property();
            ast.key = selectKey.run(this.astI.getNowTokenType(),[ast]);
            // 当是 , 或者 } 说明当前语句已经结束
            if(this.astI.isType([operator.sequenceOperator.comma,brackets.braces.rightBraces])) {
                if (!type.isType(ast.key.type,astConfig.Identifier)) this.error.syntaxError();
                ast.value = ast.key;
                properties.push(ast);
                if (this.astI.isType(operator.sequenceOperator.comma)) this.error.tokenAddOneAndUndefinedError();
                continue;
            }
            // 如果当前元素为 : 向后平移
            if (this.astI.isType(operator.conditionalOperator.colon)) 
                this.error.tokenAddOneAndUndefinedError();

            ast.value = selectValue.run(this.astI.getNowTokenType(), [ast]);
            properties.push(ast);
        } while (!this.astI.isType(brackets.braces.rightBraces));
        return properties;
    }

    /**
     * 第一个通用分析器
     */
    getSelectorTwo(){
        const expressionArray = this.selectExpressionArray();
        expressionArray.push(brackets.braces.leftBraces);
        expressionArray.push(brackets.middlebrackets.leftMiddlebrackets);
        expressionArray.push(jsKey.function);

        const select = new selector(this);
        this.selectLiteral(select).
            push(expressionArray, "expressionAna").pushDefaultRun(() => {
                this.error.syntaxError();
            }).pushAfter(() => {
                // 在运行完之后检查接下来的词素为 , token向后移动 
                if (this.astI.isType(operator.sequenceOperator.comma))
                    this.error.tokenAddOneAndUndefinedError();
            })
        return select;
    }
    /**
     * 用于分析数组
     * @param {父节点} parentNode 
     */
    arrayAna(parentNode){
        let ast = null;
        if (type.isType(parentNode.type, 
            [astConfig.FunctionDeclaration,astConfig.FunctionExpression])) {
            ast = new astObj.ArrayPattern();
        } else {
            ast = new astObj.ArrayExpression();
        }
        this.error.tokenAddOneAndUndefinedError();
        if(!this.astI.isType(brackets.middlebrackets.rightMiddlebrackets)) {
            ast.elements = this.arrayElementAna(ast);
            // 用于判断数组模式下参数是否出现错误
            if (type.isType(parentNode.type, 
                [astConfig.FunctionDeclaration, astConfig.FunctionExpression])) {
                this.arrayPatternConstraint(ast.elements);
            }
        }
        this.astI.lengthAddOne();
        return ast;
    }
    /**
     * 用于判断函数参数中拥有数组的约束
     */
    arrayPatternConstraint(elements) {
        // 当elements中的元素的类型不是 Identifier 报错
        // 当出现重复元素时报错
        const params = [];
        for (let index = 0; index < elements.length; index++) {
            if (!type.isType(elements[index].type, astConfig.Identifier) || 
                params.indexOf(elements[index].name) !== -1) {
                this.error.syntaxError();
            }
            params.push(elements[index].name);
        }
    }
    /**
     * 数组参数处理
     * @param {父节点} parentNode 
     */
    arrayElementAna(parentNode) {
        const elements = [];
        const select =this.getSelectorTwo();
        select.push(type.spread, "spreadAna");
        do{
            elements.push(select.run(this.astI.getNowTokenType(),[parentNode]));
        }while(!this.astI.isType(brackets.middlebrackets.rightMiddlebrackets));
        return elements;
    }
    /**
     * 函数分析
     * @param {父节点} parentNode 
     */
    functionAna(parentNode) {
        /**
         * function 开头
         * 首先向后平移 token (当前token类型为 function时)
         * 如果下一个 token 的类型不是 variableName 报错 （当父元素为 Program 类型时）
         * 再次向后平移 如果 token type 不是 （ 报错 
         * 继续平移 如果不是 ) 就进入参数分析器
         */
        if(this.astI.isType(jsKey.function)) this.error.tokenAddOneAndUndefinedError();
        let name =null;
        let ast = null;
        // 当父元素类型为 Program 函数必须要有 name 参数
        if(type.isType(parentNode.type, astConfig.Program)) {
            this.error.nowTokenTypeError(type.variableName);
        }
        if (!this.astI.isType(brackets.parentheses.leftParentheses)) {
            name = this.astI.getNowTokenLexeme();
            
            this.error.tokenAddOneAndUndefinedError();
        }
        // 判断 function 应该用的语法树
        if (type.isType(parentNode.type, astConfig.Program)) {
            ast = new astObj.FunctionDeclaration(name);
        }else {
            ast = new astObj.FunctionExpression(name);
        }
        this.error.nowTokenTypeError(brackets.parentheses.leftParentheses);
        this.error.tokenAddOneAndUndefinedError();
        // )
        if (!this.astI.isType(brackets.parentheses.rightParentheses)) {
            ast.params =this.functionParamAna(ast);
        }
        if(this.astI.isType(brackets.parentheses.rightParentheses)) {
            this.astI.lengthAddOne();
        }
        // 如果不是 { 报错
        this.error.nowTokenTypeError(brackets.braces.leftBraces);
        // 交给快处理器
        ast.body = this.blockAna(ast);
        
        return ast;
    }
    /**
     * 函数参数分析
     * @returns 返回一个数组里面存着
     * @param {父节点} parentNode 
     */
    functionParamAna(parentNode) {
        const params = [];
        const select = new selector(this);
        select.push(brackets.braces.leftBraces, "objectAna").
            push(brackets.middlebrackets.leftMiddlebrackets, "arrayAna").
            push(type.variableName, "variableNameAna").pushAfter(() => {
                if (this.astI.isType(operator.sequenceOperator.comma)) {
                    this.error.tokenAddOneAndUndefinedError();
                }
            }).
            // 用于判断 ...
            push(type.spread,"spreadAna",undefined,()=>{
                if(!this.astI.isType(brackets.parentheses.rightParentheses))
                    this.error.syntaxError()
            }).
            pushDefaultRun(() => {
                this.error.syntaxError();
            });

        while (!type.isType(brackets.parentheses.rightParentheses, [this.astI.getNowTokenType(),
        this.astI.getFrontTokenType()])) {
            const data = select.run(this.astI.getNowTokenType(), [parentNode]);
            params.push(this.assignmentExpressionToPattern(data));
        }
        return params;
    }
    /**
     * 用于处理函数中的 ...param
     * @param {父节点} parentNode
     */
    spreadAna(parentNode) {
        this.error.tokenAddOneAndUndefinedError();
        const select = new selector(this);
        const data = select.push(brackets.middlebrackets.leftMiddlebrackets, "arrayAna").
            push(type.variableName, "expressionAna").
            push(brackets.braces.leftBraces,"objectAna").
            pushDefaultRun(() => {
                this.error.syntaxError();
            }).run(this.astI.getNowTokenType(),[parentNode]);
        
        if (type.isType(parentNode, [astConfig.FunctionDeclaration, astConfig.FunctionExpression])) {
            if (!type.isType(data.type, [
                astConfig.Identifier,
                astConfig.ArrayPattern,
                astConfig.ObjectPattern
            ])) this.error.syntaxError();
            return new astObj.RestElement(data);
        }
        return new astObj.SpreadElement(data);
    }
    /**
     * 块分析 主要用于构造
     * BlockStatement 类
     * @param {父节点} parentNode 
     */
    blockAna(parentNode){
        const ast = new astObj.BlockStatement();
        this.error.tokenAddOneAndUndefinedError();
        if (!this.astI.isType(brackets.braces.rightBraces)) {
            // 交给块类容处理器
            ast.body = this.blockContentAna(ast);
        }
        // 去掉最后的 }
        this.astI.lengthAddOne();
        return ast;
    }
    /**
     * 这个选择器针对于方法的身体和根元素的身体
     * @param {被填充内容的数组} body 
     */
    getSelectorOne(parentNode,body){
        const select = new selector(this);
        select.push([jsKey.const, jsKey.var, jsKey.let], "variableKeyAna").
            push(jsKey.return, "returnAna").
            push(jsKey.function,"functionAna").
            push(this.selectExpressionArray(),"rootNode").
            push(brackets.middlebrackets.leftMiddlebrackets,"arrayAna").
            push(type.variableName,()=>{
                // 用于判断标记
                if (type.isType(this.astI.getBehindTokenType(), operator.conditionalOperator.colon)) {
                    const ast = new astObj.LabeledStatement(this.astI.getNowTokenLexeme());
                    // 用于调到 :
                    this.astI.lengthAddOne();
                    this.error.tokenAddOneAndUndefinedError();
                    ast.body = this.expressionAna(parentNode);
                    return ast;
                }
                return this.rootNode(parentNode);
            }).
            push(operator.sequenceOperator.comma,()=>{
                let data = body.pop();
                // 逗号元素运行时前面必须有数据
                if(data) {
                    return this.inputSequenceAna(data);
                } else {
                    this.error.syntaxError();
                }
            }).
            push(operator.conditionalOperator.questionMark,()=>{
                return this.conditionalAna(body.pop());
            }).
            push(type.arrowFunction,()=>{
                // 交给箭头函数处理
                return this.inputArrowFunctionAna(body.pop());
            }).
            pushDefaultRun(() => {
                this.astI.lengthAddOne();
            });
        return select;
    }
    /**
     * 块分析
     * @returns 数组
     * @param {父节点} parentNode 
     */
    blockContentAna(parentNode){
        const body = [];
        const select = this.getSelectorOne(parentNode,body);
        // 循环当遇到 } 时退出
        while(!this.astI.isType(brackets.braces.rightBraces)) {
            const ast = select.run(this.astI.getNowTokenType(), [parentNode]);
            if (ast) body.push(ast);
        }
        return body;
    }
    /**
     * 用于对输入三元表达式的数据进行处理
     * @param {父节点} parentNode 
     */
    inputConditionalAna(parentNode) {
        const select = selector(this);
        return select.push(astConfig.SequenceExpression,()=>{

        }).
        run(parentNode.type, [parentNode]);
    }
    /**
     * 三元表达式处理
     * @param {父节点} parentNode 
     */
    conditionalAna(parentNode){
        const ast =new astObj.ConditionalExpression();
        ast.test = parentNode;
        this.error.tokenAddOneAndUndefinedError();
        ast.consequent = this.expressionAna();
        this.error.tokenAddOneAndUndefinedError();
        ast.alternate = this.expressionAna();
        return ast;
    } 

    /**
     * 分析执行方法的参数
     * @param {父类型} parentNode 
     */
    callParamAna(parentNode){
        const params = [];
        const select = this.getSelectorTwo();
        // 用于处理 ... 展开表达式
        select.push(type.spread,"spreadAna")
        while (!type.isType(brackets.parentheses.rightParentheses,[this.astI.getNowTokenType(),this.astI.getFrontTokenType()])) {
            params.push(select.run(this.astI.getNowTokenType(), [parentNode]));
        }
        return params;
    }
    /**
     * 表达式处理 1+2+3
     * @param {父类型} parentNode 
     * @param {最后扫描到)是否平移 token} endParentheses
     */
    expressionAna(parentNode){
        const opData = [];
        const suffixData = [];
        let goOut = false;
        /**
         * 用于处理 opData中的符号
         * 当现在获取的符号优先级小于等于 opData 顶上的符号时 弹出 opData 中的符号到suffixData中
         * 当获取的符号优先级大于 opData 顶上的符号时添加符号到 suffixData 中
         */
        const opAna=(ast)=>{
            
            if (goOut) return;

            if (ast.length > 0) suffixData.push(ast[0]);

            if (this.astI.isType(brackets.parentheses.rightParentheses)) return;

            // 用于处理 => 箭头函数
            if(this.astI.isType(type.arrowFunction)) {
                suffixData.push(this.arrowFunctionAna(suffixData.pop()));
                return;
            }
            if (this.astI.isType(operator.sequenceOperator.comma)) {
                goOut = true;
                return;
            }
            if (type.isBinaryOperator(this.astI.getNowTokenType())) {

                const p1 = type.getPriority(this.astI.getNowTokenType());
                while (opData.length > 0) {
                    let op = opData.pop();

                    let p2 = type.getPriority(op.type);
                    // 判断当前符号优先级是否大于 opData 最顶上的符号
                    if (p1 > p2 || type.isType(op.type, brackets.parentheses.leftParentheses)) {
                        opData.push(op);
                        opData.push(this.astI.getNowToken());
                        break;
                    }
                    suffixData.push(op);
                }
                if (opData.length === 0) {
                    opData.push(this.astI.getNowToken());
                }
                this.astI.lengthAddOne();
            }else {
                if(this.astI.isType(type.semicolon)) {
                    this.astI.lengthAddOne();
                }
                goOut = true;
            }

        }
        /**
         * 用于构建表达式选择器
         */
        const select = new selector(this);
        this.selectLiteral(select).push(type.variableName, "variableNameAna").push([
            // 用于处理 ++ --
            operator.updateOperator.addOne,
            operator.updateOperator.reduceOne
        ], () => this.updateAna(parentNode, true)).
            push(brackets.parentheses.leftParentheses, () => {
                // 用递归的模式处理( 中的数据
                this.error.tokenAddOneAndUndefinedError();
                suffixData.push(this.expressionAna(parentNode));
                // 用于最后扫描到 ) 是否向后平移token
                if (this.astI.isType(operator.sequenceOperator.comma)) {
                    this.error.tokenAddOneAndUndefinedError();
                    suffixData.push(this.sequenceAna(suffixData.pop()));
                }
            }).push(brackets.parentheses.rightParentheses, () => {
                this.astI.lengthAddOne();
                goOut = true;
            }).
            push(jsKey.undefined, "returnIdentifierAna").
            push(jsKey.function, "functionAna").
            // 当前token 类型为 add 或者 reduce 时处理。
            //因为当是这两种情况时有可能是负数或者正数
            push([operator.binaryOperator.add,
            operator.binaryOperator.reduce],
                () => {
                    const tree = this.positiveAndNegativeAna(parentNode);
                    return tree ? tree : this.error.syntaxError();
                }).push(brackets.braces.leftBraces, "objectAna").
            push([operator.sequenceOperator.comma, type.semicolon], () => {
                // 当为, 和; 时退出
                goOut = true;
            }).
            push(type.spread, "spreadAna").
            push(brackets.middlebrackets.leftMiddlebrackets, "arrayAna").pushDefaultRun(() => {
                this.error.syntaxError();
            }).pushAfter(opAna);

        // 对数据进行递归处理
        const dataAna=()=>{
            select.run(this.astI.getNowTokenType(), [parentNode]);
            if (goOut) return;
            dataAna();
        }

        dataAna();

        while(opData.length > 0 ) {
            suffixData.push(opData.pop())
        }
        if(suffixData.length === 1) return suffixData[0];
        // 当表达式没有数据时报错 
        if(suffixData.length === 0) this.error.syntaxError();
        // 将后缀表达式转换为语法树
        // 遇到小树 添加到 opData 遇到 符号在 opData 中提取栈尾两个元素进行运算
        for (let index = 0; index < suffixData.length; index++) {
            const element = suffixData[index];
            if (type.isBinaryOperator(element.type)) {
                const right = opData.pop();
                const left = opData.pop();
                opData.push(new astObj.BinaryExpression(left, element.lexeme, right));
            } else {
                opData.push(element);
            }
        }
        return opData[0];
    }
    /**
     * 用于处理字符串和数字 true null false
     */
    returnLiteralAna() {
        this.astI.lengthAddOne();
        return new astObj.Literal(this.astI.getFrontTokenLexeme());
    }
    /**
     * 返回一个 Identifier 对象
     */
    returnIdentifierAna(){
        this.astI.lengthAddOne();
        return new astObj.Identifier(this.astI.getFrontTokenLexeme());
    }

    /**
     * 用于选择所有 Literal 元素
     * @param {selector 选择器} select 
     */
    selectLiteral(select){
        return select.push([type.number,
        type.characterString,
        jsKey.true,
        jsKey.false,
        jsKey.null
        ], "returnLiteralAna")
    }
    /**
     * 用于选择需要用 expressionAna 分析器分析的类型
     */
    selectExpressionArray() {
        return [ 
            type.variableName,
            type.number,
            type.characterString,
            operator.binaryOperator.add,
            operator.binaryOperator.reduce,
            jsKey.false,
            jsKey.undefined,
            jsKey.null,
            brackets.parentheses.leftParentheses
        ];
    }
    /**
     * 正负号处理
     * @param {父类型} parentNode 
     */
    positiveAndNegativeAna(parentNode){
        const frontType = this.astI.getFrontTokenType();
        let ast = undefined;
        
        // 判断符号前面是否为特定token
        if (!frontType||type.isAncestor(frontType, operator) || 
            type.isAncestor(frontType, brackets) ||
            type.isType(frontType,[
                type.semicolon,
                type.arrowFunction,
                jsKey.return,
                jsKey.yield,
                jsKey["yield*"]])) {

                ast = new astObj.UnaryExpression(this.astI.getNowTokenLexeme());
                this.error.tokenAddOneAndUndefinedError();

                const select = new selector(this);
                 select.push([type.number, type.characterString], "numberAndStringAna").
                    push(type.variableName,"variableNameAna").
                    push([operator.binaryOperator.add, 
                        operator.binaryOperator.reduce],"positiveAndNegativeAna").
                     push(jsKey.function,"functionAna");

                ast.argument = this.selectLiteral(select).
                    run(this.astI.getNowTokenType(), [ast]);
            }
        return ast;
    }

    /**
     * 处理 ++ 或 --
     * @param {用于标示++ 或 -- 在前面或者后面} prefix 
     * @param {父标签} parentNode 
     */
    updateAna(parentNode, prefix){
        const ast = new astObj.UpdateExpression(this.astI.getNowTokenLexeme(),prefix);
        if(prefix) {
            this.error.tokenAddOneAndUndefinedError();
            this.error.nowTokenTypeError(type.variableName);
            const tree = this.variableNameAna(ast);
            this.error.tokenTypeError(tree.type, astConfig.Identifier);
            ast.argument = tree;
        } else {
            ast.argument = parentNode;
        }
        this.astI.lengthAddOne();
        return ast;
    }

    /**
     * 用于处理返回语句
     * @param {父节点} parentNode 
     */
    returnAna(parentNode) {
        const ast = new astObj.ReturnStatement();
        if (type.isType(this.astI.getBehindOneTokenType(), [type.lineFeed, type.semicolon])) {
            this.astI.lengthAddOne();
            return ast;
        }
        this.astI.lengthAddOne();
        ast.argument = this.expressionAna(parentNode);
        return ast;
    }
}