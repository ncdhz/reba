const config = require("../config");
module.exports = class ThrowStatement {

    constructor() {
        this.type = config.ThrowStatement;
        this.argument = null;
    }

}