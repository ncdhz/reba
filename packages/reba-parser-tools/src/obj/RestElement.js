const config = require("../config");
module.exports = class RestElement {
    constructor(argument) {
        this.type = config.RestElement;
        this.argument = argument;
    }
}