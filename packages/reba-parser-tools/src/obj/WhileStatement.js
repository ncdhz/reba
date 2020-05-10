const config = require("../config");
module.exports = class WhileStatement {
    constructor() {
        this.type = config.WhileStatement;
        this.test = null;
        this.body = null;
    }
}