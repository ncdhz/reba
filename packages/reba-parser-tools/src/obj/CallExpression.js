const config = require("../config");
module.exports = class CallExpression {
    constructor(callee) {
        this.type = config.CallExpression;
        this.callee = callee;
        this.arguments = [];
    }

}