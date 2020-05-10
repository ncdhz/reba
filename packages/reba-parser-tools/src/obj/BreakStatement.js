const config = require("../config");
module.exports = class BreakStatement {
    constructor() {
        this.type = config.BreakStatement;
        this.label = null;
    }
}