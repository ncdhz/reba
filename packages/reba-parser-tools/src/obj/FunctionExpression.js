const config = require("../config");
module.exports =class FunctionExpression {
    constructor() {
        this.id =null;
        this.type = config.FunctionExpression;
        this.generator = false;
        this.params = [];
        this.body = null;
        this.async = false;
    }
}