const config = require("../config");
const Identifier = require("./Identifier");
module.exports =class FunctionExpression {
    constructor(name, params) {
        this.id = name ? new Identifier(name) : null;
        this.type = config.FunctionExpression;
        this.params = params;
        this.body = null;
    }
}