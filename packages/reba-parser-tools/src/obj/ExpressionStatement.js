const config = require("../config");
module.exports = class ExpressionStatement {
    constructor() {
        this.type = config.ExpressionStatement;
        this.expression = null;
    }
}