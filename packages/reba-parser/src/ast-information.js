const ast = require("./ast-object");
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
        this.ast = new ast.Program(sourceType);
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
        this.startLength++;
        
        while (this.isType(type.lineFeed) || 
        this.isType(type.singleLineComment) || this.isType(type.multilineComment)){
            if (this.isType(type.singleLineComment) || this.isType(type.multilineComment)) {
                this.notesStorage();
            }
            this.startLength ++;
        }
    }
    /**
     * 用于存储注解
     */
    notesStorage(){
        // 把当前token中的词素存储到 notes 中
        this.notes.push(this.getNowTokenLexeme());
    }
    /**
    * 获取标识符对象
    * @param {标识符name} name 
    */
    getIdentifier(name) {
        return new astObj.Identifier(name);
    }
    /**
     * 返回一个ast
     */
    newAST(type){

        return new astObj.AST(type);
    }
    /**
     * 当前 token类型 是否与 type 相同
     * @param {类型} type 
     */
    isType(type) {
        return type === this.getNowTokenType();
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
         this.tokens[this.startLength].type : undefined;
    }
    /**
     * 获取当前 token 在源文件处于哪一行
     */
    getNowTokenRow() {
        return this.tokenLength > this.startLength
            ? this.tokens[this.startLength].position.row : undefined;
    }
    /**
     * 获取当前Token的词素
     */
    getNowTokenLexeme(){
        return this.tokenLength > this.startLength 
        ? this.tokens[this.startLength].lexeme : undefined;
    }
    /**
     * 获取前面一个 token 的词素
     */
    getAheadTokenLexeme(){
        return this.tokenLength > this.startLength - 1
            ? this.tokens[this.startLength - 1].lexeme : undefined;
    }
    /**
     * 获取前面一个 token 的行
     */
    getAheadTokenRow() {
        return this.tokenLength  > this.startLength - 1
            ? this.tokens[this.startLength - 1].position.row : undefined;
    }
    /**
     * 获取当前 startLength 下的 token
     */
    getNowToken(){
        return this.tokens[this.startLength];
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

    /**
     * 用于在语法树中添加注解
     * @param {语法树} ast 
     */
    setComments(ast) {
        ast.comments = this.notes;
    }
}