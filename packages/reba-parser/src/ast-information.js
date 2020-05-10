const parserAst = require("reba-parser-tools");
const type = require("reba-tools").type;
module.exports = class {
    
    constructor(tokenFile, sourceType){
        
        this.tokens = tokenFile.tokens;
        // 当前touken的名字
        this.fileName = tokenFile.fileName;
        // 获取第一个token
        this.firstToken = this.tokens[0];
        // 用于存储当前遍历到了那个token
        this.startLength = 0;
        // 用于存储所有的ast树
        this.ast = new parserAst.Program(sourceType);
        // 用于存储注解
        this.notes = [];
        // 用于保存tokens的长度
        this.tokenLength = this.tokens.length;
    }

    /**
     * 跟新注解容器
     */
    removeNotes() {
        this.notes = [];
    }
    /**
     * 当前 token 标识符向后移动 1
     */
    lengthAddOne() {
        this.startLength ++;
        while (this.isType([type.lineFeed, type.singleLineComment, type.multilineComment])){
            if (this.isType(type.singleLineComment) || this.isType(type.multilineComment)) {
                this.notesStorage();
            }
            this.startLength ++;
        }
    }
    /**
     * token 标记长度向后移动
     */
    lengthReduceOne(){
        this.startLength --;
        while (this.isType([type.lineFeed, type.singleLineComment, type.multilineComment])){
            this.startLength --;
        }
    }
    /**
     * 如果当前token  type是 ; token向前平移 
     */
    ifSemicolonlengthAddOne(){
        if (this.isType(type.semicolon)) this.lengthAddOne();
    }
    /**
     * 用于存储注解
     */
    notesStorage(){
        // 把当前token中的词素存储到 notes 中
        this.notes.push(this.getNowTokenLexeme());
    }
    /**
     * 当前 token类型 是否与 type 相同
     * @param {类型 可以是数组} t
     */
    isType(t) {
        return type.isType(this.getNowTokenType(),t);
    }
    /**
     * 获取当前文件名
     */
    getFileName() {
        return this.fileName;
    }   
    /**
     * 获取当前token的类型 当token不为空时 返回当前类型
     * 当token为空时 返回 undefined
     */
    getNowTokenType(){
        return this.tokenLength >  this.startLength?
         this.getNowToken().type : undefined;
    }
    /**
     * 获取当前 token 在源文件处于哪一行
     */
    getNowTokenRow() {
        return this.tokenLength > this.startLength
            ? this.getNowToken().position.row : undefined;
    }
    /**
     * 获取当前Token的词素
     */
    getNowTokenLexeme(){
        return this.tokenLength > this.startLength 
        ? this.getNowToken().lexeme : undefined;
    }
    /**
    * 获取当前 startLength 下的 token
    */
    getNowToken() {
        return this.tokenLength > this.startLength ? this.tokens[this.startLength] : undefined;
    }
    /**
     * 获取前面一个 token 的 type
     * 判断到 \n 跳过
     */
    getFrontTokenType() {
        return this.getFrontToken()
            ? this.getFrontToken().type : undefined;
    }
    /**
     * 获取前面一个 token 的词素
     * 判断到 \n 跳过
     */
    getFrontTokenLexeme(){
        return this.getFrontToken()
        ? this.getFrontToken().lexeme : undefined;
    }
    
    /**
     * 获取前面一个 token 的行
     * 判断到 \n 跳过
     */
    getFrontTokenRow() {
        return this.getFrontToken()
            ? this.getFrontToken().position.row : undefined;
    }
    /**
     * 获取前面一个 token
     * 判断到 \n 跳过
     */
    getFrontToken(){
        let i = 1;
        for ( ;this.tokens[this.startLength - i]
            && type.isType(this.tokens[this.startLength - i].type, [type.lineFeed,
                type.multilineComment,
                type.singleLineComment]); i++);
        return this.tokens[this.startLength - i];
    }
    /**
     * 获取后面一个 token 的词素
     * 判断到 \n 跳过
     */
    getBehindTokenLexeme() {
        return this.getBehindToken()
            ? this.getBehindToken().lexeme : undefined;
    }
    /**
     * 获取当前token的后一个token不排除 \n
     */
    getBehindOneTokenType(){
        const token = this.tokens[this.startLength + 1];
        return token? token.type:undefined;
    }
    /**
     * 获取后面一个 token 的行
     * 判断到 \n 跳过
     */
    getBehindTokenRow() {
        return this.getBehindToken()
            ? this.getBehindToken().position.row : undefined;
    }
    /**
     * 获取后面一个 token 的type
     * 判断到 \n 跳过
     */
    getBehindTokenType() {
        return this.getBehindToken()
            ? this.getBehindToken().type : undefined;
    }
    /**
     * 获取后一个元素的Token
     */
    getBehindToken() {
        let i = 1;
        for (; this.tokens[this.startLength + i]
            && type.isType(this.tokens[this.startLength + i].type, [type.lineFeed,
            type.multilineComment,
            type.singleLineComment]); i++);
        return this.tokens[this.startLength + i];
    }
    /**
     * 初始当前token
     */
    newFirstToken(){
        this.firstToken = this.tokens[this.startLength];
    }
    /**
     *  把 startLength 加 1 并获取token
     */
    getLengthAddOneToken(){
        this.lengthAddOne();
        return this.getNowToken();
    }

}