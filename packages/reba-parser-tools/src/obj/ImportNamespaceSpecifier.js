const config = require("../config");
module.exports = class ImportNamespaceSpecifier {
    constructor() {
        this.type = config.ImportNamespaceSpecifier;
        this.local = null;
    }

}