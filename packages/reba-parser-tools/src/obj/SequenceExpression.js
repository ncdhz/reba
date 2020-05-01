const config = require("../config");
module.exports = class SequenceExpression {
    constructor() {
        this.type = config.SequenceExpression;
        this.expressions = [];
    }
}