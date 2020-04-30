const config = require("../config");
module.exports = class BinaryExpression {
    constructor(left, operator, right) {
        this.type = config.BinaryExpression;
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}
