const config = require("../config");
const Identifier = require("./Identifier");
module.exports = class AssignmentExpression {
    constructor(left, operator, right) {
        this.type = config.AssignmentExpression;
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}