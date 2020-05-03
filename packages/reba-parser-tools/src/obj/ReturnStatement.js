const config = require("../config");
module.exports = class ReturnStatement {

    constructor() {
        this.type = config.ReturnStatement;
        this.argument = null;
    }
}