const config = require("../config");
module.exports = class CallExpression {
    constructor() {
        this.type = config.CallExpression;
        this.callee = null;
        this.arguments = [];
    }

}