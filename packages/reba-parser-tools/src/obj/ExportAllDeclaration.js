const config = require("../config");
module.exports = class ExportAllDeclaration {
    constructor() {
        this.type = config.ExportAllDeclaration;
        this.declaration = null;
        this.exported = null;
    }

}