const config = require("../config");
module.exports = class ForStatement {
    constructor() {
        this.type = config.ForStatement;
        this.body = null;
        this.init = null;
        this.test = null;
        this.update = null;
    }
}