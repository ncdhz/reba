const config = require("../config");
module.exports = class ImportSpecifier {
    constructor() {
        this.type = config.ImportSpecifier;
        this.local = null;
        this.imported = null;
    }

}