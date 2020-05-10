const config = require("../config");
module.exports = class SwitchStatement {
    constructor() {
        this.type = config.SwitchStatement;
        this.discriminant =null;
        this.cases=[];
    }
}