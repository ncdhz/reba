const lexical = require("reba-lexical");
const parser = require("./parser")
const token = lexical("./src/1");
if(token.isFile) {
    for(let i = 0 ; i< token.tokenInformations.length  ; i++ ) {
        const ast = parser.getAST(token.tokenInformations[i].tokens);
        console.log(ast);
    }
}
