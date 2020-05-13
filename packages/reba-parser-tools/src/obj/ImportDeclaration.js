const config = require("../config");
module.exports = class ImportDeclaration {
    constructor() {
        this.type = config.ImportDeclaration;
        this.specifiers = [];
        this.source = null;
    }
}