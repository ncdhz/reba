const config = require("../config");
module.exports = class YieldExpression {
    constructor() {
        this.type = config.YieldExpression;
        this.delegate = false;
        this.argument = null;
    }
}