const config = require("../config");
module.exports = class MemberExpression {

    constructor(property, object) {
        this.object = object;
        this.type = config.MemberExpression;
        this.property = property;
    }
}