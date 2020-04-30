const config = require("../config");
module.exports = class Literal {
    constructor(value) {
        this.type = config.Literal;
        this.value = value;
    }
}