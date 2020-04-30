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
        this.astI = astI;
        this.error = new error(astI);
    }

    rootNode(parentNode) {
        const ast = new astObj.ExpressionStatement();

        const select = new selector(this);
        ast.expression = select.push(type.variableName, "variableName").
        run(this.astI.getNowTokenType(),[ast]);
        return ast;
    }
    variableKeyAna(parentNode){

        let ast = new astObj.VariableDeclaration(this.astI.getNowTokenType());
        this.error.tokenAddOneAndUndefinedError();
        this.error.nowTokenTypeError(type.variableName);
        /**
         * 一个类型有可能有多个变量
         * let x, y
         */
        this.variableKeyDeclarationsAna(ast);

        return ast;
    }
    
    variableName(parentNode) {
        // 构建选择器 用于分类处理
        const select = new selector(this);
        // 当后面跟着 .
        return select.push(operator.memberOperator.spot,"objMemberAna").
            // 当后面跟着 [
            push(brackets.middlebrackets.leftMiddlebrackets, "arrMemberAna").
            // 当后面跟着 (
            push(brackets.parentheses.leftParentheses,"callAna").
            // 当后面跟着 =
            push(operator.assignmentOperator.equal,"equalAna").
            // 当后面跟着 ,
            push(operator.sequenceOperator.comma,"sequenceAna").
            // 其他
            pushDefaultRun(()=>{
                this.astI.lengthAddOne();
                return new astObj.Identifier(this.astI.getFrontTokenLexeme());
            }).
            run(this.astI.getBehindTokenType(),[parentNode]);
    }

    sequenceAna(parentNode) {

    }


    objMemberAna(parentNode) {
        let object = null;
        if (type.isType(parentNode.type, astConfig.MemberExpression)) {
            object = parentNode;
        } else {
            object = new astObj.Identifier(this.astI.getNowTokenLexeme());
            this.astI.lengthAddOne();
        }
        this.error.tokenAddOneAndUndefinedError();
        this.error.nowTokenTypeError(type.variableName);
        
        const select =new selector(this);

        const ast = new astObj.MemberExpression(this.astI.getNowTokenLexeme(), object);
        this.astI.lengthAddOne();
        const data = select.push(brackets.parentheses.leftParentheses,"callAna").
        push(operator.memberOperator.spot,"objMemberAna").run(this.astI.getNowTokenType(),[ast]);
        
        return data?data: ast;

    }

    arrMemberAna(parentNode) {

    }

    callAna(parentNode) {
        let ast = null;
        if (type.isType(parentNode.type, astConfig.MemberExpression)) {
            ast = new astObj.CallExpression(parentNode);
        } else {
            ast = new astObj.CallExpression(this.astI.getNowTokenLexeme());
            this.astI.lengthAddOne();
        }
        this.error.tokenAddOneAndUndefinedError();

        if(!this.astI.isType(brackets.parentheses.rightParentheses)) {
            ast.arguments = this.paramAna(ast)
        }
        this.astI.lengthAddOne();
        return ast;
    }

    variableKeyDeclarationsAna(parentNode) {
        const declarator = new astObj.VariableDeclarator(this.astI.getNowTokenLexeme());
        parentNode.declarations.push(declarator);
        this.astI.lengthAddOne();

        const select = new selector(this);
        /**
         * 判断当为 等号时向等号分析器分发
         * 当为 ， 号时说明这是一个另一个同类型元素，直接调用分析器
         */
        select.push(operator.assignmentOperator.equal, ()=>{
                this.error.undefinedError(this.astI.getBehindTokenType());
                declarator.init = this.equalAna(declarator);
            }).
            push(operator.sequenceOperator.comma,()=>{
                /**
                 * 当前token向前加一 没有token报错
                 * 加一后的token type 不为 variableName 报错
                 */
                this.error.tokenAddOneAndUndefinedError();
                this.error.nowTokenTypeError(type.variableName);
                this.variableKeyDeclarationsAna(parentNode);
            }).
            pushDefaultRun(()=>{
                /**
                 * 当 token 类型不是 ，和 = 时 判断其父元素类型为 const 报错
                 */
                this.error.typeEqualError(parentNode.kind, jsKey.const);
            }).
            run(this.astI.getNowTokenType());

    }

    equalAna(parentNode){

    }

    functionAna(parentNode) {
        /**
         * function 开头
         * 首先向后平移 token 如果下一个 token 的类型不是 variableName 报错
         * 再次向后平移 如果 token type 不是 （ 报错 
         * 继续平移 如果不是 ) 就进入参数分析器
         */
        this.error.tokenAddOneAndUndefinedError();
        this.error.nowTokenTypeError(type.variableName);
        const name = this.astI.getNowTokenLexeme();
        this.error.tokenAddOneAndUndefinedError();
        this.error.nowTokenTypeError(brackets.parentheses.leftParentheses);
        const ast = new astObj.FunctionDeclaration();
        this.error.tokenAddOneAndUndefinedError();
        // )
        if (!this.astI.isType(brackets.parentheses.rightParentheses)) {
            this.paramAna(ast);
        }
        // 去掉最后的 )
        this.error.tokenAddOneAndUndefinedError();
        // {
        // 如果不是 { 报错
        this.error.nowTokenTypeError(brackets.braces.leftBraces);
        
        ast.body = new astObj.BlockStatement();

        this.error.tokenAddOneAndUndefinedError();

        if (!this.astI.isType(brackets.braces.rightBraces)) {
            // 交给类容处理器
            this.blockContentAna(ast.body);
        }
        // 去掉最后的 }
        this.astI.lengthAddOne();
        return ast;
    }

    blockContentAna(parentNode){

    }

    paramAna(parentNode) {

    }
    /**
     * 表达式处理 1+2+3
     * @param {父类型} parentNode 
     */
    expressionAna(parentNode){
        const opData = [];
        const suffixData = [];

        const dataAna = (parent)=>{
            const select = new selector(this);
            const ast = select.push(type.variableName, "variableName").
                push(brackets.parentheses.leftParentheses,()=>{
                    opData.push(this.astI.getNowToken());
                    this.error.tokenAddOneAndUndefinedError();
                }).push(brackets.parentheses.rightParentheses,()=>{
                    let op = opData.pop();
                    while(!type.isType(op.type, brackets.parentheses.leftParentheses)) {
                        if (!op) this.error.syntaxError();
                        suffixData.push(op.lexeme);
                        op = opData.pop();
                    }
                    this.astI.lengthAddOne();
                }).push([type.number, type.characterString], () => {
                    this.astI.lengthAddOne();
                    return new astObj.Literal(this.astI.getFrontTokenLexeme());
                }).run(this.astI.getNowTokenType(), [parent]);
            if(ast) {
                suffixData.push(ast);
            }
            if(type.isBinaryOperator(this.astI.getNowTokenType())) {
                const p1 = type.getPriority(this.astI.getNowTokenType());

                while(opData.length > 0) {
                    let op = opData.pop();
                    let p2 = type.getPriority(op.type);

                    if(p1 > p2 || type.isType(op.type, brackets.parentheses.leftParentheses)) {
                        opData.push(op);
                        opData.push(this.astI.getNowToken());
                        break;
                    }

                    suffixData.push(op.lexeme);
                }

                if(opData.length === 0) {
                    opData.push(this.astI.getNowToken());
                }
                this.astI.lengthAddOne();
                dataAna(parent);
            } 
            if ( this.astI.getNowToken()&&
                (type.isAncestor(this.astI.getFrontTokenType(), operator) || 
                type.isAncestor(this.astI.getBehindTokenType(),operator)))
                dataAna(parent);
        }
        dataAna(parentNode);
        while(opData.length > 0 ) {
            suffixData.push(opData.pop().lexeme)
        }
        console.log(suffixData);
    }

    /**
     * 正负号处理
     * @param {父类型} parentNode 
     */
    positiveAndNegative(parentNode){
        const frontType = this.astI.getFrontTokenType();
        if (type.isAncestor(frontType, operator) || 
            type.isType(type.semicolon, frontType) || 
            type) {

            }
    }
}