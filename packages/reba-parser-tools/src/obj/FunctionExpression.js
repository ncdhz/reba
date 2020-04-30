const config = require("../config");
const Identifier = require("./Identifier");
module.exports =class FunctionExpression {
    constructor(name, params) {
        this.id = name === null ? null : new Identifier(name);
        this.type = config.FunctionExpression;
        this.params = params;
        this.body = null;
    }
}