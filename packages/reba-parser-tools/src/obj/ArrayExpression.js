const config = require("../config");

module.exports = class ArrayExpression {
    constructor() {
        this.type = config.ArrayExpression;
        this.elements = null;
    }
}