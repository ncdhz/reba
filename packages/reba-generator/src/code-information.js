const typeCode = require("reba-tools").typeCode;
const operator = require("reba-tools").typeCode.operator;

module.exports = class {

    constructor(alignmentSpace) {
        this.alignmentSpace = alignmentSpace;
        this.code = [];
        this.spaceNum = 0;
    }
    /**
     * 用于缩进添加缩颈空格
     */
    addSpaceNum() {
        this.spaceNum += this.alignmentSpace;
        return this;
    }
    /**
     * 添加分号
     */
    addSemicolon(){
        this.addExceptEnter(typeCode.semicolon);
        this.addEnter();
        return this;
    }
    /**
     * 获取code最后一个元素
     */
    getEndCode(){
        return this.code[this.code.length - 1];
    }
    /**
     * 去除回车添加代码
     * @param {代码} code 
     */
    addExceptEnter(code){
        if (this.code[this.code.length - 1] === typeCode.lineFeed) {
            this.code.pop();
            if (code === typeCode.semicolon){
                if (this.code[this.code.length - 1] === typeCode.semicolon)
                    this.code.pop();
            }
            this.add(code);
        } else {
            this.add(code);
        }
        return this;
    }
    /**
     * 减少缩进空格
     */
    reduceSpaceNum() {
        this.spaceNum -= this.alignmentSpace;
        return this;
    }
    /**
     * 空格打印
     */
    spaceAlignment() {
        let num = this.spaceNum;
        for (; num > 0; num--) {
            this.add(' ');
        }
        return this;
    }
    /**
     * 合并代码时前面加入空格
     * @param {代码} code 
     */
    addFrontSpace(code) {
        this.addSpace();
        this.add(code);
        return this;
    }
    addCommaExceptEndNode(index, length) {
        if (index < length - 1) {
            this.addExceptEnter(operator.sequenceOperator.comma).addSpace();
        }
    }
    /**
     * 添加一个空格
     */
    addSpace() {
        this.add(" ");
        return this;
    }
    /**
     * 合并代码时后面加入空格
     * @param {代码} code 
     */
    addBehindSpace(code) {
        this.add(code);
        this.addSpace();
        return this;
    }
    /**
     * 前后都加上空格
     * @param {代码} code 
     */
    addFrontBehindSpace(code) {
        this.addSpace();
        this.add(code);
        this.addSpace();
        return this;
    }
    /**
     * 合并代码
     * @param {代码} code
     */
    add(code) {
        this.code.push(code);
        return this;
    }

    /**
     * 合并代码时前面加入回车
     * @param {代码} code 
     */
    addFrontEnter(code) {
        this.addEnter();
        this.add(code);
        return this;
    }
    /**
     * 合并代码时后面加入回车
     * @param {代码} code 
     */
    addBehindEnter(code) {
        this.add(code);
        this.addEnter();
        return this;
    }
    /**
     * 添加换行符号
     */
    addEnter(){
        if (this.code[this.code.length - 1] !== typeCode.lineFeed) {
            this.add(typeCode.lineFeed);
        }
    }
    /**
     * 获取拼接好的代码
     */
    getCode() {
        return this.code.join("");
    }
}