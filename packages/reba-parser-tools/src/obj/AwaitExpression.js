const config = require("../config");
module.exports = class AwaitExpression {
    constructor() {
        this.type = config.AwaitExpression;
        this.argument = null;
    }
}