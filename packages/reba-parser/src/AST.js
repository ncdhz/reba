module.exports = class {
    constructor(ast, isFile = false, filePath){
        this.isFile = isFile;
        this.ast = null;
        this.filePath = null;
    }
}