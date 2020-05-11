const config = require("../config");
module.exports = class ClassBody {
    constructor() {
        this.type = config.ClassBody;
        this.body = [];
    }

}