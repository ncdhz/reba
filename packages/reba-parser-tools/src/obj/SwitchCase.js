const config = require("../config");
module.exports = class SwitchCase {
    constructor() {
        this.type = config.SwitchCase;
        this.consequent = null;
        this.test = null;
    }
}