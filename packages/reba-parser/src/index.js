const lexical = require("reba-lexical");
const parser = require("./parser")
const AST = require("./AST")
module.exports = function (information, conf) {
    const token = lexical(information, conf);
    const isFile = token.isFile;
    const ASTS = [];
    for (let i = 0; i < token.tokenInformations.length; i++) {
        const ast = new AST(parser.getAST(token.tokenInformations[i]),
            "module", isFile, token.tokenInformations[i].fileName);
        ASTS.push(ast);
    }
    return ast;
}