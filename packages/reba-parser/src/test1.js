const that = this;
// 选择合适的处理器
function variableEqualSwitchAna() {
    const select = new selector(that);
    select.push(jsKey.function, "functionAna").
        push(brackets.braces.leftBraces, "objectAna");
    return select.run(that.astInformation.getNowTokenType(), [ast]);;
}
// 用于处理箭头函数
function variableArrowFunctionAna() {
    switch (parentNode.type) {
        case astConfig.Property:
            ast = that.arrowFunctionAna(parentNode);
            break;
        default:
            ast.expression = that.arrowFunctionAna(ast);
    }
}

function variableSwitchAna() {
    let tree = null;
    that.astInformation.lengthAddOne();
    switch (that.astInformation.getNowTokenType()) {
        // 当后面token type为等于号
        case operator.assignmentOperator.equal:
            let left = that.astInformation.getAheadTokenLexeme();
            const op = that.astInformation.getNowTokenLexeme();
            that.astInformation.lengthAddOne();
            // 交个处理器
            let right = variableEqualSwitchAna();

            tree = new astObj.AssignmentExpression(left, op, right);
            break;
        // 当后面类型为箭头函数
        case type.arrowFunction:
            variableArrowFunctionAna();
            break;
        case brackets.parentheses.leftParentheses:
            tree = that.callAna(ast);
            break;
        // 当后面类型为 . 时判断为对象属性
        case operator.memberOperator.spot:
            tree = that.memberAna(ast);
            break;
        default:
            tree = new astObj.Identifier(that.astInformation.getAheadTokenLexeme());
            // 当字符是 , 时token向后平移
            if (that.astInformation.isType(operator.sequenceOperator.comma))
                that.astInformation.lengthAddOne();
    }
    return tree;
}