const config = require("../config");
module.exports = class ClassExpression {
    constructor() {
        this.type = config.ClassExpression;
        this.id = null;
        this.body = null;
        this.superClass = null;
    }

}