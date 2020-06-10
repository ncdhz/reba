const astConfig = require("reba-parser-tools").config;
module.exports = {
    name: [
        astConfig.ClassDeclaration,
        astConfig.ClassExpression
    ],
    value: function (obj) {
        
    }
}