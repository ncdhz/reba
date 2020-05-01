const analysis= require("./analysis-tools");
const astInformation = require("./ast-information");

const rebaTools = require("reba-tools");
const selector = rebaTools.selector;

const type = rebaTools.type;
const operator = type.operator;

const brackets = type.brackets;
const jsKey = type.jsKey;

function getAST(tokenFile, sourceType) {

    const astI = new astInformation(tokenFile, sourceType);
    const ast = astI.ast;
    const astBody = astI.ast.body;
    const ana = new analysis(astI);
    const select = new selector(ana);
    select.push([
        jsKey.const,
        jsKey.var,
        jsKey.let
    ], "variableKeyAna").
    push(jsKey.function, "functionAna").
    push([
        type.variableName, 
        type.number, 
        operator.binaryOperator.add,
        operator.binaryOperator.reduce
    ], "rootNode").
    pushDefaultRun(function () {
        astI.lengthAddOne();
    })
    // 构建选择器
    // select.push([
    //     jsKey.const,
    //     jsKey.var,
    //     jsKey.let
    // ], "variableKeyAna").push([
    //     type.singleLineComment,
    //     type.multilineComment,
    // ],function(){
    //     ana.addComment();
    // }).push(jsKey.function,"functionAna").push(type.variableName, "variableAna").
    //     push(brackets.middlebrackets.leftMiddlebrackets,"arrayAna").
    //     push(brackets.braces.leftBraces,"blockStatementAna").
    //     pushDefaultRun(function(){
    //         astI.lengthAddOne();
    //     }).push(jsKey.this,"thisAna");
    
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
    