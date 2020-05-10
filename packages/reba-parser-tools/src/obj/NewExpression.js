const config = require("../config");
module.exports = class NewExpression {

    constructor() {
        this.type = config.NewExpression;
        this.callee = null;
        this.arguments = [];
    }
}