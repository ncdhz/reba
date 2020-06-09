const analysis= require("./analysis-tools");
const astInformation = require("./ast-information");

function getAST(tokenFile, sourceType) {
    const astI = new astInformation(tokenFile, sourceType);
    const ast = astI.ast;
    const astBody = astI.ast.body;
    const ana = new analysis(astI);
    const select = ana.getSelectorOne(ast,astBody);
    while(astI.getNowToken()) {
        const data = select.run(astI.getNowTokenType(), [ast]);
        if (data) astBody.push(data);
        astI.newFirstToken();
    }
    return astI.ast;
}
module.exports = {
    getAST
}
    