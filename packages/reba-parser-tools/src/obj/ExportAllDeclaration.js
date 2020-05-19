const config = require("../config");
module.exports = class ExportAllDeclaration {
    constructor() {
        this.type = config.ExportAllDeclaration;
        this.source = null;
        this.exported = null;
    }

}