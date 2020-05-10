const config = require("../config");
module.exports = class ForOfStatement {
    constructor() {
        this.type = config.ForOfStatement;
        this.body = null;
        this.left = null;
        this.right = null;
    }
}