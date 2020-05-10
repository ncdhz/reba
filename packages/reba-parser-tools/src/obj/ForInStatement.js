const config = require("../config");
module.exports = class ForInStatement {
    constructor() {
        this.type = config.ForInStatement;
        this.body = null;
        this.left = null;
        this.right = null;
    }
}