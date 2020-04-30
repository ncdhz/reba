const config = require("../config");
const Identifier = require("./Identifier");
module.exports = class FunctionDeclaration {
    constructor(name) {
        this.type = config.FunctionDeclaration;
        this.id = new Identifier(name);
        this.params = [];
        this.body = null;
    }

}