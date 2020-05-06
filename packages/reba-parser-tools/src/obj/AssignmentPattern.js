const config = require("../config");
module.exports = class AssignmentPattern {
    constructor(left,right) {
        this.type = config.AssignmentPattern;
        this.left = left;
        this.right = right;
    }
}