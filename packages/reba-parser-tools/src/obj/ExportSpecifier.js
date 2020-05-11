const config = require("../config");
module.exports = class ExportSpecifier {
    constructor() {
        this.type = config.ExportSpecifier;
        this.local = null;
        this.exported = null;
    }

}