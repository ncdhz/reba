const rebaTools = require("reba-tools");
const error = require("./error");
const astObj = require("./ast-object"); 
const astConfig= require("./ast-config");
const type = rebaTools.type;
const brackets = type.brackets;
const jsKey = type.jsKey;

module.exports = class {

    constructor(astI) {
        this.astInformation = astI;
        this.isComment = false;
        this.bracketsArray = [];
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
    addComment(){  
        if(this.isComment) {
            this.astInformation.removeNotes();
            this.changeCommentToFalse();
        }
        this.astInformation.lengthAddOne();
    }
    /**
     * const let var 开头的语法树分析
     */
    variableKeyAna(parentNode){
        const ast = new astObj.VariableDeclaration(this.astInformation.getNowTokenType());
        this.astInformation.lengthAddOne();
        if (!this.astInformation.isType(type.variableName)) this.syntaxError();
        ast.declarations.push(this.variableAna(ast));

        return ast;
         
    }

    /**
     * 以变量开始的语法树分析
     * @param {语法树父节点} parentNode 
     */
    variableAna(parentNode){
        let ast = null; 
        switch (parentNode.type) {
            case astConfig.VariableDeclaration:
                ast = new astObj.VariableDeclarator(this.astInformation.getAheadTokenLexeme());
                
                // if (this.astInformation.getLengthAddOneToken()) {
                //     if (type.isEqual(this.astInformation.getNowTokenType())) {
                //        this.astInformation.lengthAddOne()
                //         ast.init = this.expressionAna(ast);
                //     }
                // } else if (type.isType(parentNode.kind,jsKey.const)) {
                //     this.syntaxError();
                // }
                break;
        }
        return ast;
    }

    /**
     * 用于处理函数
     * @param {父节点}} parentNode 
     */
    functionAna(parentNode) {
        let ast = null;
        if(type.isType(parentNode.type, astConfig.Program)) {
            switch (this.undefinedError(this.astInformation.getNowTokenType())) {
                case jsKey.function:
                    this.astInformation.lengthAddOne();
                    // token必须是 variableName
                    if(!this.astInformation.isType(type.variableName)){
                        this.syntaxError();
                    }
                    const id = this.astInformation.getNowTokenLexeme();
                    this.astInformation.lengthAddOne();
                    const params = this.functionParams();
                    ast = new astObj.FunctionDeclaration(id,params);
                    this.astInformation.lengthAddOne();
                    if (!this.astInformation.isType(brackets.braces.leftBraces)) this.syntaxError();

                    this.bracketsArray.push(this.astInformation.getNowToken());
                    this.astInformation.lengthAddOne();

                    let element = null;
                    while (!this.astInformation.isType(brackets.braces.rightBraces)) {

                        switch (this.astInformation.getNowTokenType()) {
                            case jsKey.const:
                            case jsKey.var:
                            case jsKey.let:
                                element=this.variableKeyAna(ast);
                                break;
                        }
                        ast.body.body.push(element);
                    }
                    break;
            }
        }
        return ast;
    }
    /**
     * 用于提取函数里面的参数
     * (param1,param2,...params)
     */
    functionParams(){
        const params = [];
        if (!this.astInformation.isType(brackets.parentheses.leftParentheses)) {
            this.syntaxError()
        } 
        this.bracketsArray.push(this.astInformation.getNowToken());
        this.astInformation.lengthAddOne();
        
        while (!this.astInformation.isType(brackets.parentheses.rightParentheses)) {
            // 判断是否为 ...
            if (this.astInformation.isType(type.spread)) {
                // token 向后加一位
                this.astInformation.lengthAddOne();
                // token 类型不是 variableName 报错
                if (!this.astInformation.isType(type.variableName)) this.syntaxError();
                // 添加 token 到 params
                params.push(new astObj.RestElement(this.astInformation.getNowTokenLexeme()));
                // token向后移动
                this.astInformation.lengthAddOne();
                // 判断如果不是 ) 报错
                if (!this.astInformation.isType(brackets.parentheses.rightParentheses)) this.syntaxError();
            } else {
                // 如果类型不是 variableName 报错
                if (!this.astInformation.isType(type.variableName)) this.syntaxError();
                // 添加 token 到 params
                params.push(new astObj.Identifier(this.astInformation.getNowTokenLexeme()));
                // token 向后移动
                this.astInformation.lengthAddOne();
                // 如果既不是 ) 又不是 , 报错
                if (!this.astInformation.isType(brackets.parentheses.rightParentheses) &&
                    !type.isSequenceOperator(this.astInformation.getNowTokenType())) this.syntaxError();
                // 如果是 , token向后移动
                if (type.isSequenceOperator(this.astInformation.getNowTokenType())) this.astInformation.lengthAddOne();
            }
        }
        this.astInformation.lengthAddOne();
        this.bracketsArray.pop();
        return params;
    }

    /**
     * 表达式分析
     * @param {父节点} parentNode 
     */
    expressionAna(parentNode){
        let ast = null;
        // 用于判断接下来的操作符是所所需要的操作符
        function isExpression( type ){
            return type === type.number || 
            type === type.characterString || 
            type === type.variableName;
        }
        // 用于存储接下来的表达式所需要的token
        const nodeArray = [];
        while (isExpression(this.astInformation.getNowTokenType())||
            type.isBinaryOperator(this.astInformation.getNowTokenType())||
            type.isAncestor(this.astInformation.getNowTokenType(), brackets)){
            nodeArray.push(this.astInformation.getNowToken());
            this.astInformation.lengthAddOne();
        }
        console.log(nodeArray);
        // let left = null;
        // let operator = null;
        // let right = null;
        // if (type.isType(parentNode.type, astConfig.BinaryExpression)) {
        //     left = parentNode;
        // } else {
        //     switch (this.astInformation.getNowTokenType()) {
        //         case type.number:
        //         case type.characterString:
        //         case type.variableName:
        //             left = new astObj.Identifier(this.astInformation.getNowTokenLexeme());
        //             this.astInformation.lengthAddOne();
        //             break;
        //         default:
        //             this.syntaxError();
        //     }
        // }

        // if (type.isBinaryOperator(this.astInformation.getNowTokenType())) {
        //     operator = this.astInformation.getNowTokenLexeme();
        //     this.astInformation.lengthAddOne();
        //     switch (this.astInformation.getNowTokenType()) {
        //         case type.number:
        //         case type.characterString:
        //         case type.variableName:
        //             right = new astObj.Identifier(this.astInformation.getNowTokenLexeme());
        //             this.astInformation.lengthAddOne();
        //             ast = this.expressionAna(new astObj.BinaryExpression(left, operator, right));
        //             break;
        //         default:
        //             this.syntaxError();
        //     }
        // } else {
        //     ast = left;
        // }
        
        return ast;
    }
    /**
     * 用于处理语法错误
     */
    syntaxError(){
        if (this.astInformation.getNowTokenRow())
            error.syntaxError(this.astInformation.getNowTokenRow(),
                this.astInformation.getNowTokenLexeme(),
                this.astInformation.getFileName());
        else
            error.syntaxError(this.astInformation.getAheadTokenRow(),
                this.astInformation.getAheadTokenLexeme(),
                this.astInformation.getFileName());
    }
    /**
     * 用于处理返回值是 undefined 错误
     */
    undefinedError(data){
        return data === undefined ? this.syntaxError() : data;
    }
}