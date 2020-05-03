const config = require("../config");
const Identifier = require("./Identifier");
module.exports = class LabeledStatement {
    constructor(label) {
        this.type = config.LabeledStatement;
        this.label = new Identifier(label);
        this.body = null;

    }
}