const config = require("../config");
module.exports = class ImportDefaultSpecifier {
    constructor() {
        this.type = config.ImportDefaultSpecifier;
        this.local = null;
    }
}