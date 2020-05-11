const config = require("../config");
module.exports = class VariableDeclarator {
    constructor() {
        this.type = config.VariableDeclarator;
        this.id = null;
        this.init = null;
    }
}