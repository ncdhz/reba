const config = require("../config");
module.exports = class ContinueStatement {
    constructor() {
        this.type = config.ContinueStatement;
        this.label = null;
    }
}