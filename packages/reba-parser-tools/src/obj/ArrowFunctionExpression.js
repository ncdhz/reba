const config = require("../config");

module.exports =class ArrowFunctionExpression {

    constructor() {
        this.params = [];
        this.type = config.ArrowFunctionExpression;
        this.body = null;
    }
}