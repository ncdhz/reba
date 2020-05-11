const config = require("../config");
module.exports = class WithStatement {
    constructor() {
        this.type = config.WithStatement;
        this.object = false;
        this.body = null;
    }
}