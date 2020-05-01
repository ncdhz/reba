const config = require("../config");
const Identifier = require("./Identifier");
module.exports = class MemberExpression {

    constructor(property, object) {
        this.object = object;
        this.type = config.MemberExpression;
        this.property = property;
    }
}