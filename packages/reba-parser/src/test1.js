/**
     * 表达式处理 1+2+3
     * @param {父类型} parentNode 
     */
expressionAna(parentNode){
    const opData = [];
    const suffixData = [];
    let goOut = false;
    const that = this;
    let leftParenthesesNum = 0;
    /**
     * 用于处理 opData中的符号
     * 当现在获取的符号优先级小于等于 opData 顶上的符号时 弹出 opData 中的符号到suffixData中
     * 当获取的符号优先级大于 opData 顶上的符号时添加符号到 suffixData 中
     */
    function opAna(ast) {
        if (ast.length > 0) suffixData.push(ast[0]);
        if (that.astI.isType(brackets.parentheses.rightParentheses) ||
            type.isType(brackets.parentheses.leftParentheses,
                that.astI.getFrontTokenType())) { return; }

        if (type.isBinaryOperator(that.astI.getNowTokenType())) {

            const p1 = type.getPriority(that.astI.getNowTokenType());
            while (opData.length > 0) {
                let op = opData.pop();

                let p2 = type.getPriority(op.type);
                // 判断当前符号优先级是否大于 opData 最顶上的符号
                if (p1 > p2 || type.isType(op.type, brackets.parentheses.leftParentheses)) {
                    opData.push(op);
                    opData.push(that.astI.getNowToken());
                    break;
                }
                suffixData.push(op);
            }
            if (opData.length === 0) {
                opData.push(that.astI.getNowToken());
            }
            that.astI.lengthAddOne();
        } else {
            if (that.astI.isType(type.semicolon)) {
                that.astI.lengthAddOne();
            }
            goOut = true;
        }

    }
    // 对数据进行递归处理
    function dataAna(parent) {
        const select = new selector(that);
        select.push(type.variableName, "variableNameAna").push([
            operator.updateOperator.addOne,
            operator.updateOperator.reduceOne
        ], () => that.updateAna(parent, true)).
            push(brackets.parentheses.leftParentheses, () => {
                leftParenthesesNum++;
                opData.push(that.astI.getNowToken());
                that.error.tokenAddOneAndUndefinedError();
            }).push(brackets.parentheses.rightParentheses, () => {
                /**
                 * 当遇到 ) 时检查 opData中是否还有 ( 没有返回 undefined
                 */
                if (leftParenthesesNum <= 0) {
                    leftParenthesesNum--;
                    goOut = true;
                    return undefined;
                }
                /**
                 * opData弹栈直到遇到 ( 为止               
                 */
                let op = opData.pop();
                while (!type.isType(op.type, brackets.parentheses.leftParentheses)) {
                    if (!op) that.error.syntaxError();
                    suffixData.push(op);
                    op = opData.pop();
                }
                that.astI.lengthAddOne();
            }).
            push(jsKey.undefined, "returnIdentifierAna").
            push(jsKey.function, "functionAna").
            // 当前token 类型为 add 或者 reduce 时处理。
            //因为当是这两种情况时有可能是负数或者正数
            push([operator.binaryOperator.add,
            operator.binaryOperator.reduce],
                () => {
                    const tree = that.positiveAndNegativeAna(parent);
                    return tree ? tree : that.error.syntaxError();
                }).pushAfter(opAna).push(brackets.braces.leftBraces, "objectAna").
            push(brackets.middlebrackets.leftMiddlebrackets, "arrayAna");

        that.selectLiteral(select).run(that.astI.getNowTokenType(), [parent]);

        if (goOut) return;
        dataAna(parent);
    }

    dataAna(parentNode);

    while (opData.length > 0) {
        suffixData.push(opData.pop())
    }
    if (suffixData.length === 1) return suffixData[0];
    // 当表达式没有数据时报错 
    if (suffixData.length === 0) this.error.syntaxError();
    // 将后缀表达式转换为语法树
    // 遇到小树 添加到 opData 遇到 符号在 opData 中提取栈尾两个元素进行运算
    for (let index = 0; index < suffixData.length; index++) {
        const element = suffixData[index];
        if (type.isBinaryOperator(element.type)) {
            const right = opData.pop();
            const left = opData.pop();
            opData.push(new astObj.BinaryExpression(left, element.lexeme, right));
        } else {
            opData.push(element);
        }
    }
    return opData[0];
}