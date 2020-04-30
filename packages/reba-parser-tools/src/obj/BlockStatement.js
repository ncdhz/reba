const config = require("../config");
module.exports = class BlockStatement {
    constructor() {
        this.type = config.BlockStatement;
        this.body = []
    }
}