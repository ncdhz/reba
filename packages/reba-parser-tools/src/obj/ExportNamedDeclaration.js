const config = require("../config");
module.exports = class ExportNamedDeclaration {
    constructor() {
        this.type = config.ExportNamedDeclaration;
        this.declaration = null;
        this.specifiers = [];
        this.source = null;
    }

}