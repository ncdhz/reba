const config = require("../config");
const Identifier = require("./Identifier");
module.exports = class Property{
    constructor(){
        this.type = config.Property;
        this.key = null;
        this.value = null;
    }
}