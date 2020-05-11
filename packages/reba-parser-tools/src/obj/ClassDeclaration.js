const config = require("../config");
module.exports = class ClassDeclaration {
    constructor() {
        this.type = config.ClassDeclaration;
        this.id = null;
        this.body = null;
        this.superClass = null;
    }

}