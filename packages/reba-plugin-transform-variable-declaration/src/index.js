const astConfig = require("reba-parser-tools").config;
module.exports = {
    name: astConfig.VariableDeclaration,
    value: function (obj) {
           if(typeof obj.ast === "object"){
               obj.ast.kind = 'var';
           }
    }
}