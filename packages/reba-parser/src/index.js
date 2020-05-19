const lexical = require("reba-lexical");
const parserTools = require("./parser");
const AST = require("./AST");
/**
 * 给定源码有关信息返回语法树数组
 * @param {源码信息} information 
 * @param {源码配置} conf 
 */
function parser(information, conf = undefined) {
    const token = lexical(information, conf);
    const isFile = token.isFile;
    const ASTS = [];
    for (let i = 0; i < token.tokenInformations.length; i++) {
        const ast = new AST(parserTools.getAST(token.tokenInformations[i], "module")
            , isFile, token.tokenInformations[i].filePath);
        ASTS.push(ast);
    }
    return ASTS;
}
/**
 * 给定token信息返回语法树数组
 * @param {token信息} tokenI 
 */
function rebaParser(tokenI) {
    const ASTS = [];
    for (let i = 0; i < tokenI.tokenInformations.length; i++) {
        const ast = new AST(parserTools.getAST(tokenI.tokenInformations[i], "module")
            , tokenI.isFile, tokenI.tokenInformations[i].filePath);
        ASTS.push(ast);
    }
    return ASTS;
}

module.exports = {
    parser,
    rebaParser
}