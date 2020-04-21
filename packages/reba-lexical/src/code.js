const token = require("./token");
module.exports = class {

    constructor(sourceCode) {
        // 用于标记当前解析到那个字符
        this.codeStartLength = 0;
        // 用于记录第一个字符 通过第一个字符判断后面所需要的解析器
        this.codeFirstChar = sourceCode[0];
        // 用于存储解析完成的 token
        this.tokens = [];
        this.code = sourceCode;
        this.codeLength = sourceCode.length;
    }
    /**
     * 用于把标记符增加1 并返回当前标识符下的字符
     */
    getNowChar() {
        this.codeStartLength++;
        return this.code[this.codeStartLength - 1];
    }
    /**
     * 用于去除空格
     */
    trimCode() {
        while (this.code[this.codeStartLength] === ' ') {
            this.codeStartLength++;
        }
    }
    /**
     * 用于添加 token
     */
    setToken(start,end,type,lexeme){
        this.tokens.push(new token(start, end, type,lexeme));
    }
}