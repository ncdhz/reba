const traverser = require("./traverser");
const selector = require("reba-traverser").selector;
const generatorTools = require("./generator-tools");
const codeInformation = require("./code-information");

/**
 * {语法树} ast
 * {生成代码时对齐空格数} alignmentSpace
 */
module.exports = function (ast, alignmentSpace) {
    const code = new codeInformation( alignmentSpace );
    const select = new selector();
    const gt = new generatorTools(select, code);
    select.pushOperation(gt);
    traverser(select);
    select.run(ast.type, [ast])
    return code.getCode();
}