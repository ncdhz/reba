const config = require("../config");
module.exports = class FunctionDeclaration {
    constructor() {
        this.type = config.FunctionDeclaration;
        this.id = null;
        this.generator = false;
        this.params = [];
        this.body = null;
    }

}