const config = require("../config");
module.exports = class IfStatement {
    constructor() {
        this.type = config.IfStatement;
        this.test = null;
        this.consequent=null;
        this.alternate = null;
    }
}