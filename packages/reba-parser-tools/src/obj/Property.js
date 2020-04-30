const config = require("../config");
const Identifier = require("./Identifier");
module.exports = class Property{
    constructor(key){
        this.type = config.Property;
        this.key = new Identifier(key);
        this.value = null;
    }
}