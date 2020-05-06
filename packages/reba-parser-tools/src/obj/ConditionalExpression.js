const config = require("../config");
module.exports = class ConditionalExpression {
    constructor() {
        this.type = config.ConditionalExpression;
        this.test = null;
        this.consequent = null;
        this.alternate = null;
    }

}