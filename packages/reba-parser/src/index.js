const lexical = require("reba-lexical");
const parser = require("./parser")
const token = lexical("./src/test.js");
// console.log(token.tokenInformations[0].tokens)
for(let i = 0 ; i< token.tokenInformations.length  ; i++ ) {
    const ast = parser.getAST(token.tokenInformations[i],"module");
    console.log(JSON.stringify(ast, null, 4));
}
