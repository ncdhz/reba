const config = require("../config");
module.exports = class UnaryExpression {
    constructor(operator) {
        this.type = config.UnaryExpression;
        this.operator = operator;
        this.argument = null;
    }
}