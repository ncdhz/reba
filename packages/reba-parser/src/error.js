module.exports = class{
    
    constructor(astI){
        this.astInformation = astI;
    }
    
    syntaxErrorAna(row, lexeme, filename, describe = undefined){
        
        const d = describe ? describe : '';

        throw new Error("syntax error : { "+ (filename === ''?"source code ":"file name: [ "+
        filename+" ] ")+ "row:[ " + row + 
            " ]  lexeme: [ " + lexeme  +" ] "+d+"}");
    }
    syntaxErrorDefaultAna(describe = undefined) {
        if (this.astInformation.getNowTokenRow())
            this.syntaxErrorAna(this.astInformation.getNowTokenRow(),
                this.astInformation.getNowTokenLexeme(),
                this.astInformation.getFileName(), describe);
        else
            this.syntaxErrorAna(this.astInformation.getFrontTokenRow(),
                this.astInformation.getFrontTokenLexeme(),
                this.astInformation.getFileName(), describe);
    }

    reservedError(){
        this.syntaxErrorDefaultAna("The keyword '"+this.astInformation.getNowTokenType()+"' is reserved ")
    }

    /**
    * 用于处理语法错误
    * 首先返回当前 token 所在位置的语法错误
    * 如果当前token为 undefined 则返回上一个 token 所在未知的语法错误
    */
    syntaxError() {
        this.syntaxErrorDefaultAna(undefined);
    }
    /**
     * 用于处理返回值是 undefined 错误
     */
    undefinedError(data) {
        return data === undefined ? this.syntaxError() : data;
    }
    /**
     * token 向后移动
     * 当下一个元素为 undefined 时报错
     */
    tokenAddOneAndUndefinedError() {
        return this.undefinedError(
            this.astInformation.getLengthAddOneToken());
    }

    /**
     * 当前元素类型不符时报错
     * @param {类型} type 
     */
    nowTokenTypeError(type) {
        if (!this.astInformation.isType(type)) this.syntaxError();
    }
    /**
     * 类型一和类型二相等报错
     * @param {类型一} type1 
     * @param {类型二} type2 
     */
    typeEqualError(type1,type2) {
        if(type1 === type2) this.syntaxError();
    }
    /**
     * 当type1 与 type2 类型不同时报错
     * @param {类型一} type1 
     * @param {类型二} type2 
     */
    tokenTypeError(type1,type2) {
        if(type1 !== type2) this.syntaxError();
    }
    /**
     * 当前token类型与 数组类型没有符合时报错
     * @param {类型数组} typeArray 
     */
    nowTokenTypeArrayError(typeArray) {
       this.tokenTypeArrayError(typeArray, this.astInformation.getNowTokenType());
    }
    /**
     * typeArray 中不存在 type 报错
     * @param {类型数组} typeArray 
     * @param {类型} type 
     */
    tokenTypeArrayError(typeArray, type) {
        for (let index = 0; index < typeArray.length; index++) {
            if (type === typeArray[index]) return;
        }
        this.syntaxError();
    } 
}