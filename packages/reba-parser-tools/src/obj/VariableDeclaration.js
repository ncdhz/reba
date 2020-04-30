const config = require("../config");
module.exports = class VariableDeclaration {
    constructor(kind) {
        this.type = config.VariableDeclaration;
        this.kind = kind;
        this.declarations = [];
        this.comments = [];
    }
}