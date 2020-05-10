const config = require("../config");
module.exports = class DoWhileStatement {
    constructor() {
        this.type = config.DoWhileStatement;
        this.test = null;
        this.body = null;
    }
}