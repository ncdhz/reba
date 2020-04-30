const config = require("../config");
const Identifier = require("./Identifier");
module.exports = class CallExpression {
    constructor(callee) {
        this.type = config.CallExpression;
        this.callee = new Identifier(callee);
        this.arguments = [];
    }

}