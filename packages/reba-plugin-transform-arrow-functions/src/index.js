const astObj = require("reba-parser-tools");
const astConfig = astObj.config;

module.exports = {
    name:astConfig.ArrowFunctionExpression,
    value:function(obj){
        const expressionStatement= new astObj.ExpressionStatement();
        const functionExpression = new astObj.FunctionExpression();
        expressionStatement.expression = functionExpression;
        functionExpression.parenthesized = true;
        functionExpression.body = obj.ast.body;
        functionExpression.params = obj.ast.params;
        functionExpression.async = obj.ast.async;
        obj.parentNode[obj.parentNodeKey] = functionExpression;
    }
}