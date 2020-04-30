const config = require("../config");
module.exports = class Program {

    constructor(sourceType) {
        this.sourceType = sourceType;
        this.body = [];
        this.type = config.Program;
    }
    
}