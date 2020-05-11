const config = require("../config");
module.exports = class TryStatement {
    constructor() {
        this.type = config.TryStatement;
        this.block = null;
        this.handler = null;
        this.finalizer = null;
    }

}