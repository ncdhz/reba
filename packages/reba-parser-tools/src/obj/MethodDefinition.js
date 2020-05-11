const config = require("../config");
module.exports = class MethodDefinition {
    constructor() {
        this.type = config.MethodDefinition;
        this.kind = "method";
        this.static = false;
        this.computed = null;
        this.key = null;
        this.value = null;
    }
    
}