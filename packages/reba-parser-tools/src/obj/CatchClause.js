const config = require("../config");
module.exports = class CatchClause {
    constructor() {
        this.type = config.CatchClause;
        this.param = null;
        this.body = null;
    }

}