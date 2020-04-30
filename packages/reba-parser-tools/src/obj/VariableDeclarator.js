const config = require("../config");
const Identifier = require("./Identifier");
module.exports = class VariableDeclarator {
    constructor(name) {
        this.type = config.VariableDeclarator;
        this.id = new Identifier(name);
        this.init = null;
    }
}