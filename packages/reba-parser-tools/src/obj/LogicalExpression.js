const config = require("../config");
module.exports = class LogicalExpression {
    constructor(operator) {
        this.type = config.LogicalExpression;
        this.left = null;
        this.operator = operator;
        this.right = null;
    }
}