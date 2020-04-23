const analysis= require("./analysis-tools");
const astInformation = require("./ast-information");
const rebaTools = require("reba-tools");
const type = rebaTools.type;
const jsKey = type.jsKey;

function getAST(tokenFile, sourceType) {

    const astI = new astInformation(tokenFile, sourceType);
    const ast = astI.ast;

    const ana = new analysis(astI);

    while(astI.getNowToken()) {
        switch (astI.getNowTokenType()) {
            case jsKey.const:
            case jsKey.var:
            case jsKey.let:
                // 当token类型为 const时进入 
                ast.push(ana.variableKeyAna(ast));
                break;
            case type.singleLineComment:
            case type.multilineComment:
                ana.addComment();
                break;
            case jsKey.function:
                ast.push(ana.functionAna(ast));
                break;
            default:
                astI.lengthAddOne();
        }
        astI.newFirstToken();
    }

    return astI.ast;
}
module.exports = {
    getAST
}
    