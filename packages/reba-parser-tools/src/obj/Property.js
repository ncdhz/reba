const config = require("../config");
module.exports = class Property{
    constructor(){
        this.type = config.Property;
        this.key = null;
        this.value = null;
        this.method = false;
        this.shorthand = false;
    }
}