const config = require("../config");
const Identifier = require("./Identifier")
module.exports = class AssignmentPattern {
    constructor(left) {
        this.type = config.AssignmentPattern;
        this.left = new Identifier(left);
        this.right = null;
    }
}