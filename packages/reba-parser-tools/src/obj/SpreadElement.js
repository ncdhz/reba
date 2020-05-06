const config = require("../config");
module.exports = class SpreadElement {
    constructor(argument) {
        this.type = config.SpreadElement;
        this.argument = argument;
    }
}