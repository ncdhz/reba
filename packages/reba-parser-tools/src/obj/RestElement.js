const config = require("../config");
const Identifier = require("./Identifier");
module.exports = class RestElement {

    constructor(value) {
        this.type = config.RestElement;
        this.argument = new Identifier(value);
    }
}