const config = require("../config");
module.exports = class ObjectPattern {
    constructor() {
        this.type = config.ObjectPattern;
        this.properties = [];
    }
}