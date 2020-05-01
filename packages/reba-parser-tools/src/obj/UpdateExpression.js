const config = require("../config");
module.exports = class UpdateExpression {
    constructor(operator,prefix) {
        this.type = config.UpdateExpression;
        this.operator = operator;
        this.argument = null;
        this.prefix = prefix;
    }
}