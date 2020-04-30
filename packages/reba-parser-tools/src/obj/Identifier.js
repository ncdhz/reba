const config = require("../config");
module.exports = class Identifier {
    constructor(name) {
        this.type = config.Identifier;
        this.name = name;
    }
}