const config = require("../config");

module.exports = class ArrayPattern {
    constructor() {
        this.type = config.ArrayPattern;
        this.elements = [];
    }
}