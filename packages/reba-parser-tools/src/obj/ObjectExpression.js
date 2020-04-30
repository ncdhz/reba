const config = require("../config");

module.exports = class ObjectExpression{

    constructor(){
        this.type = config.ObjectExpression;
        this.properties = [];
    }
}