const config = require("../config");
module.exports = class AssignmentExpression {
    constructor() {
        this.type = config.AssignmentExpression;
        this.left = null;
        this.operator = null;
        this.right = null;
    }
}