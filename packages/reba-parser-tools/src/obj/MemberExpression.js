const config = require("../config");
module.exports = class MemberExpression {

    constructor() {
        this.object = null;
        this.type = config.MemberExpression;
        this.property = null;
        this.computed = false;
    }
}