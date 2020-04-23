const astConfig = require("./ast-config");
/**
 * 二元表达式
 */ 
class BinaryExpression{
    
    constructor(left, operator, right){
        this.type = astConfig.BinaryExpression;
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}
class RestElement{

    constructor(value){
        this.type = astConfig.RestElement;
        this.argument = new Identifier(value);
    }
}
class BlockStatement{
    constructor() {
        this.type = astConfig.BlockStatement;
        this.body = []
    }
}
/**
 * 字面意思
 */
class Literal{

    constructor(value){
        this.type = astConfig.Literal;
        this.value = value;
    }
}
class FunctionDeclaration{
    constructor(name,params){
        this.type = astConfig.FunctionDeclaration;
        this.id = new Identifier(name);
        this.params = params;
        this.body = new BlockStatement();
    }
}
class Program {
    constructor(sourceType) {
        this.sourceType = sourceType;
        this.body = [];
        this.type = astConfig.Program;
    }
    push(obj) {
        this.body.push(obj);
    }
}
class Identifier {
    constructor(name) {
        this.type = astConfig.Identifier;
        this.name = name;
    }
}
class VariableDeclaration {
    constructor(kind) {
        this.type = astConfig.VariableDeclaration;
        this.kind = kind;
        this.declarations = [];
        this.comments = [];
    }
}
class VariableDeclarator {
    constructor(name) {
        this.type = astConfig.VariableDeclarator;
        this.id = new Identifier(name);
        this.init = null;
    }
}
module.exports = {
    VariableDeclaration,
    VariableDeclarator,
    Identifier,
    Program,
    BinaryExpression,
    FunctionDeclaration,
    RestElement
}