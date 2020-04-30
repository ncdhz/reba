const config = require("../config");

module.exports =class ArrowFunctionExpression {

    constructor(params) {
        this.params = params;
        this.type = config.ArrowFunctionExpression;
        this.body = null;
    }
}