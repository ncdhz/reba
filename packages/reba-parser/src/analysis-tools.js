const rebaTools = require("reba-tools");

const error = require("./error");
const selector = require("reba-traverser").selector;

const astObj = require("reba-parser-tools");
const astConfig = astObj.config;

const type = rebaTools.type;
const operator = type.operator;
const brackets = type.brackets;
const jsKey = type.jsKey;

module.exports = class {
    /**
     * 
     * @param {语法树信息存储类} astI 
     */
    constructor(astI) {
        this.astI = astI;
        this.error = new error(astI);
    }

    /**
     * 构建 ExpressionStatement 对象并向下找到合适的分析函数
     */
    rootNode(parentNode) {
        const ast = new astObj.ExpressionStatement();
        const select = new selector(this);
        ast.expression = select.push(this.getExpressionArray(), "expressionAna").
            push([jsKey.yield, jsKey["yield*"]], "yieldAna").
            run(this.astI.getNowTokenType(), [parentNode]);

        return ast;
    }

    /**
     * 用于处理 const var let
     * @param {父节点} parentNode 
     */
    variableKeyAna(parentNode) {
        let ast = new astObj.VariableDeclaration(this.astI.getNowTokenType());
        this.error.tokenAddOneAndUndefinedError();
        /**
         * 一个类型有可能有多个变量
         * let x, y
         */
        ast.declarations = this.variableKeyDeclarationsAna(ast, parentNode);
        return ast;
    }

    variableKeyDeclarationsAna(parentNode, node) {
        const declarations = [];
        // 用于 VariableDeclarator 的 id 选择
        const selectId = new selector(this);
        selectId.push(brackets.braces.leftBraces, "objectAna").
            push(brackets.middlebrackets.leftMiddlebrackets, "arrayAna"). 
            pushDefaultRun(()=>{
                return this.returnIdentifierAna();
            });

        do {
            if (this.astI.isType(operator.sequenceOperator.comma))
                this.error.tokenAddOneAndUndefinedError();
            // 遇到保留关键字报错
            this.reservedAna();
            const declarator = new astObj.VariableDeclarator();
            declarator.id = selectId.run(this.astI.getNowTokenType(), [declarator]);
            declarations.push(declarator);
            if(this.astI.isType(operator.sequenceOperator.comma)){
                if (!declarator.init &&
                    type.isType(parentNode.kind, jsKey.const) &&
                    !type.isType(node.type, astConfig.ForStatement))
                    this.error.syntaxError();
                continue;
            };
            if(this.astI.isType(operator.assignmentOperator.equal)) {
                this.astI.lengthAddOne();
                declarator.init = this.equalAna(declarator);
                // 箭头函数初始化
                if (type.isType(this.astI.getNowTokenType(), type.arrowFunction)) {
                    declarator.init = this.arrowFunctionAna(node, declarator.init);
                }
                if (!declarator.init &&
                    type.isType(parentNode.kind, jsKey.const) &&
                    !type.isType(node.type, astConfig.ForStatement)) this.error.syntaxError();
            }
           
        } while (this.astI.isType(operator.sequenceOperator.comma));
        return declarations;
    }

    variableNameAna(parentNode) {
        // 当选择器没有选中时默认调用的方法
        const defaultAna = () => {
            // 当是赋值token 交给赋值分析器分析
            if (type.isAssignmentOperator(this.astI.getBehindTokenType())) {
                return this.equalAna(parentNode);
            }
            let ast = this.returnIdentifierAna();
            if (type.isType(this.astI.getNowTokenType(), [
                operator.updateOperator.reduceOne,
                operator.updateOperator.addOne
            ])) {
                ast = this.updateAna(ast, false);
            }
            return ast;
        }
        // 构建选择器 用于分类处理
        const select = new selector(this);
        // 当后面跟着 .
        return select.push(operator.memberOperator.spot, "objMemberAna").
            // 当后面跟着 [
            push(brackets.middlebrackets.leftMiddlebrackets, "arrMemberAna").
            // 当后面跟着 (
            push(brackets.parentheses.leftParentheses, "callAna").
            push(type.arrowFunction, ()=>{
                return this.arrowFunctionAna(parentNode,this.returnIdentifierAna());
            }).
            // 其他
            pushDefaultRun(defaultAna).
            run(this.astI.getBehindTokenType(), [parentNode]);
    }

    /**
     * 用于处理箭头函数初始化的值
     * @param {父节点} parentNode 
     */
    inputArrowFunctionAna(parentNode) {
        const select = new selector(this);
        select.push(astConfig.ExpressionStatement, () => {
            if (type.isType(parentNode.expression.type, astConfig.AssignmentExpression)) {
                parentNode.expression.right = this.arrowFunctionAna(parentNode, parentNode.expression.right);
            } else if (type.isType(parentNode.expression.type, astConfig.SequenceExpression)) {
                parentNode.expression = this.arrowFunctionAna(parentNode, parentNode.expression);
            }
        }).
            run(parentNode.type);
        return parentNode;
    }
    /**
     * 箭头函数处理
     * @param {父节点} parentNode 
     * @param {箭头函数的参数节点} node
     */
    arrowFunctionAna(parentNode, node) {
        // 对箭头函数中的参数处理
        const formatParam = (element) => {
            if (type.isType(element.type, astConfig.ObjectExpression)) {
                const properties = element.properties;
                this.objectPatternConstraint(properties);
                element = new astObj.ObjectPattern();
                element.properties = properties;
            }
            if (type.isType(element.type, astConfig.ArrayExpression)) {
                const elements = element.elements;
                this.arrayPatternConstraint(elements);
                element = new astObj.ArrayPattern();
                element.elements = elements;
            }
            return this.assignmentExpressionToPattern(element);
        }
        /**
         * 当节点为SpreadElement时把他转换为 
         * @param {节点} element 
         */
        const spreadToRest = (element) => {
            if (type.isType(element.type, astConfig.SpreadElement)) {
                if (type.isType(astConfig.BinaryExpression, element.argument.type))
                    this.error.syntaxError();
                return new astObj.RestElement(formatParam(element.argument));
            }
            return element;
        }
        /**
         * 当参数为数组时对数组进行处理
         * @param {数组} elements 
         */
        const arrayAna = (elements) => {
            for (let index = 0; index < elements.length; index++) {
                let element = elements[index];
                element = elements[index] = formatParam(element);
                elements[index] = spreadToRest(element);
            }
            return elements;
        }
        
        const ast = new astObj.ArrowFunctionExpression();

        if (type.isType(parentNode.type, astConfig.AsyncStatement)) {
            ast.async = true;
        }
        // node 当传入的参数不是空时处理
        if (node) {
            if(node instanceof Array) {
                ast.params = arrayAna(node);
            } else {
                if (type.isType(node.type, astConfig.SequenceExpression)) {
                    ast.params = arrayAna(node.expressions);
                } else {
                    let element = formatParam(node);
                    element = spreadToRest(element);
                    ast.params.push(element);
                }
            }
        }

        this.astI.lengthAddOne();

        if (this.astI.isType(brackets.braces.leftBraces)) {
            ast.body = this.blockAna(ast);
        } else {
            ast.body = this.expressionAna(ast);
        }
        return ast;
    }
    /**
     * 交给序列分析器时进行的预处理
     * @param {数据} node
     */
    inputSequenceAna(node) {
        if (type.isType(node.type, astConfig.ExpressionStatement)) {
            node.expression = this.sequenceAna(node.expression);
        } else {
            return this.sequenceAna(node);
        }
        return node;
    }
    /**
     * 序列处理
     * @param {父节点} node
     */
    sequenceAna(node) {
        // 当, 前面没有数据时报语法错误
        if (!node) this.astI.syntaxError();
        let ast = new astObj.SequenceExpression();
        ast.expressions.push(node);
        do {
            // 当为 , 时token向后移动且后面必须有可用的token
            if (this.astI.isType(operator.sequenceOperator.comma)) {
                this.error.tokenAddOneAndUndefinedError();
            }
            ast.expressions.push(this.expressionAna(ast));
        } while (this.astI.isType(operator.sequenceOperator.comma) &&
            !type.isType(this.astI.getFrontTokenType(), brackets.parentheses.rightParentheses));
        return ast;
    }
    /**
     * 对象成员分析
     * @param {父节点} parentNode 
     */
    objMemberAna(parentNode) {
        const ast = new astObj.MemberExpression();

        if (this.astI.isType(operator.memberOperator.spot)) {
            ast.object = parentNode;
        } else if (this.astI.isType(jsKey.this)) {
            ast.object = new astObj.ThisExpression();
            this.error.tokenAddOneAndUndefinedError();
        } else {
            ast.object = this.returnIdentifierAna();
        }
        this.error.tokenAddOneAndUndefinedError();
        if (!this.astI.isType(type.variableName) && !type.isParent(this.astI.getNowTokenType(), jsKey)) {
            this.error.syntaxError();
        }
        ast.property = this.returnIdentifierAna();
        return this.getSelectorThree().run(this.astI.getNowTokenType(), [ast]);
    }
    /**
     * 第三个选择器
     * 此选择器主要运用在 callAna objMemberAna arrayMemberAna 等分析器中
     */
    getSelectorThree() {
        const select = new selector(this);
        return select.push(brackets.parentheses.leftParentheses, "callAna").
            push(brackets.middlebrackets.leftMiddlebrackets, "arrMemberAna").
            push(operator.memberOperator.spot, "objMemberAna").
            pushDefaultRun((ast) => {
                if (type.isAssignmentOperator(this.astI.getNowTokenType())){
                    if(type.isType(ast.type, astConfig.ArrayExpression)) {
                        const tree = new astObj.ArrayPattern();
                        tree.elements = ast.elements;
                        ast = tree;
                    }
                    return this.equalAna(ast);
                }
                return ast;
            });
    }
    /**
     * 函数成员分析器
     * @param {父节点} parentNode 
     */
    arrMemberAna(parentNode) {
        const ast = new astObj.MemberExpression();
        ast.computed = true;
        ast
        if (this.astI.isType(brackets.middlebrackets.leftMiddlebrackets)) {
            ast.object = parentNode;
        } else if (this.astI.isType(jsKey.this)) {
            ast.object = new astObj.ThisExpression();
            this.astI.lengthAddOne();
        } else {
            ast.object = this.returnIdentifierAna();
        }
        this.astI.lengthAddOne();
        const data = this.expressionAna(ast);
        ast.property = this.isSequenceAna(data);
        this.astI.removeRightParentheses();
        this.astI.lengthAddOne();
        return this.getSelectorThree().run(this.astI.getNowTokenType(), [ast]);
    }
    /**
     * 对象中的方法分析
     * @param {父节点} parentNode 
     */
    callAna(parentNode) {
        const ast = new astObj.CallExpression();
        if (this.astI.isType(brackets.parentheses.leftParentheses)) {
            ast.callee = parentNode;
        } else if (this.astI.isType(jsKey.this)) {
            ast.callee = new astObj.ThisExpression();
            this.error.tokenAddOneAndUndefinedError();
        } else {
            ast.callee = this.returnIdentifierAna();
        }
        this.error.tokenAddOneAndUndefinedError();

        if (!this.astI.isType(brackets.parentheses.rightParentheses)) {
            ast.arguments = this.callParamAna(ast);
        }

        this.astI.removeRightParentheses();
        return this.getSelectorThree().run(this.astI.getNowTokenType(), [ast]);
    }
    /**
     * 分析执行方法的参数
     * @param {父类型} parentNode 
     */
    callParamAna(parentNode) {
        const params = [];
        const select = this.getSelectorTwo();
        // 用于处理 ... 展开表达式
        select.push(type.spread, "spreadAna");
        while (!type.isType(brackets.parentheses.rightParentheses, [this.astI.getNowTokenType(),
        this.astI.getFrontTokenType()])) {
            params.push(select.run(this.astI.getNowTokenType(), [parentNode]));
        }
        return params;
    }

    /**
     * 对象中赋值分析
     * @param {父节点} parentNode 
     */
    equalAna(parentNode) {

        if (type.isType(parentNode.type, astConfig.VariableDeclarator)) {
            if (this.astI.isType(jsKey.async)) {
                return this.asyncAna(parentNode);
            }
            // 交给选择器处理
            return this.expressionAna(parentNode);
        }
        const ast = new astObj.AssignmentExpression();

        if (type.isAssignmentOperator(this.astI.getNowTokenType())) {
            ast.left = parentNode;
        } else {
            ast.left = this.returnIdentifierAna();
        }
        ast.operator = this.astI.getNowTokenLexeme();
        this.error.tokenAddOneAndUndefinedError();
        if (this.astI.isType(jsKey.async)) {
            ast.right = this.asyncAna(parentNode);
        } else {
            ast.right = this.expressionAna(ast);
        }
        return ast;
    }
    /**
     * 分配表达式转换为分配模式
     * 主要运用在函数中
     */
    assignmentExpressionToPattern(node) {
        if (type.isType(node.type, astConfig.AssignmentExpression)) {
            if (node.operator !== "=") {
                this.error.syntaxError();
            }
            node = new astObj.AssignmentPattern(node.left, node.right);
        }
        return node;
    }
    /**
     * 用于分析对象
     * @param {父节点} parentNode 
     */
    objectAna(parentNode) {
        // 去掉 {
        this.error.tokenAddOneAndUndefinedError();
        let ast = null;
        if (type.isType(parentNode.type, [astConfig.FunctionDeclaration,
        astConfig.FunctionExpression,astConfig.TryStatement,astConfig.VariableDeclarator])) {
            ast = new astObj.ObjectPattern();
        }
        else {
            ast = new astObj.ObjectExpression();
        }
        if (!this.astI.isType(brackets.braces.rightBraces)) {
            ast.properties = this.objPropertyAna(ast);
            // 当父类为 function 对参数进行检查
            if (type.isType(parentNode.type, [astConfig.FunctionDeclaration,
                astConfig.FunctionExpression, astConfig.TryStatement])) {
                this.objectPatternConstraint(ast.properties);
            }
        }
        this.astI.lengthAddOne();
        return ast;
    }
    /**
     * 用于判断函数参数中拥的对象约束
     */
    objectPatternConstraint(properties) {
        const params = [];
        // 当 properties 中元素的key和value不是Identifier报语法错误
        for (let index = 0; index < properties.length; index++) {
            const element = properties[index];
            if (!type.isType(element.key.type, [astConfig.Identifier, astConfig.Literal]) ||
                !type.isType(element.value.type, astConfig.Identifier) ||
                params.indexOf(element.key.name) !== -1)
                this.error.syntaxError();

            params.push(element.key.name);
        }
    }
    /**
     * 对象参数分析
     * @param {父节点} parentNode 
     */
    objPropertyAna(parentNode) {
        const properties = [];
        const selectKey = new selector(this);
        this.selectLiteral(selectKey).push(type.variableName, "returnIdentifierAna").
            pushDefaultRun(() => {
                if (type.isParent(this.astI.getNowTokenType(), jsKey)) {
                    this.error.tokenAddOneAndUndefinedError();
                    return new astObj.Identifier(this.astI.getFrontTokenLexeme());
                } else {
                    this.error.syntaxError();
                }
            });
        // 获取分析器
        const selectValue = this.getSelectorTwo();
        selectValue.push(brackets.parentheses.leftParentheses, (tree)=>{
            tree.method = true;
            return this.functionAna(tree);
        }).
            push(jsKey.async, "asyncAna");

        do {
            const ast = new astObj.Property();

            properties.push(ast);
            ast.key = selectKey.run(this.astI.getNowTokenType(), [ast]);
            // 当是 , 或者 } 说明当前语句已经结束
            if (this.astI.isType([operator.sequenceOperator.comma, brackets.braces.rightBraces])) {
                if (!type.isType(ast.key.type, astConfig.Identifier)) this.error.syntaxError();
                ast.shorthand = true;
                ast.value = ast.key;
                if (this.astI.isType(operator.sequenceOperator.comma)) this.error.tokenAddOneAndUndefinedError();
                continue;
            }
            // 用于处理 async 语句
            if (!this.astI.isType([operator.conditionalOperator.colon, brackets.parentheses.leftParentheses]) &&
                type.isType(this.astI.getFrontTokenType(), jsKey.async)) {
                this.astI.lengthReduceOne();
                ast.value = this.asyncAna(parentNode);
                if (this.astI.isType(operator.sequenceOperator.comma)) this.error.tokenAddOneAndUndefinedError();
                continue;
            }

            // 如果当前元素为 : 向后平移
            if (this.astI.isType(operator.conditionalOperator.colon))
                this.error.tokenAddOneAndUndefinedError();
            ast.value = selectValue.run(this.astI.getNowTokenType(), [ast]);
        } while (!this.astI.isType(brackets.braces.rightBraces));
        return properties;
    }
    /**
     * 第一个通用分析器
     */
    getSelectorTwo() {
        const expressionArray = this.getExpressionArray();
        expressionArray.push(brackets.braces.leftBraces);
        expressionArray.push(brackets.middlebrackets.leftMiddlebrackets);
        expressionArray.push(jsKey.function);
        expressionArray.push(jsKey["function*"]);
        const select = new selector(this);
        this.selectLiteral(select).
            push(expressionArray, "expressionAna").pushDefaultRun(() => {
                this.error.syntaxError();
            }).pushAfter(() => {
                // 在运行完之后检查接下来的词素为 , token向后移动 
                if (this.astI.isType(operator.sequenceOperator.comma))
                    this.error.tokenAddOneAndUndefinedError();
            })
        return select;
    }
    /**
     * 用于分析数组
     * @param {父节点} parentNode 
     */
    arrayAna(parentNode) {
        let ast = null;
        if (type.isType(parentNode.type,
            [astConfig.FunctionDeclaration, astConfig.FunctionExpression,
                astConfig.TryStatement,astConfig.VariableDeclarator])) {
            ast = new astObj.ArrayPattern();
        } else {
            ast = new astObj.ArrayExpression();
        }
        this.error.tokenAddOneAndUndefinedError();
        if (!this.astI.isType(brackets.middlebrackets.rightMiddlebrackets)) {
            ast.elements = this.arrayElementAna(ast);
            // 用于判断数组模式下参数是否出现错误
            if (type.isType(parentNode.type,
                [astConfig.FunctionDeclaration, astConfig.FunctionExpression,
                    astConfig.TryStatement,astConfig.VariableDeclarator])) {
                this.arrayPatternConstraint(ast.elements);
            }
        }
        this.astI.lengthAddOne();
        if(type.isType(parentNode.type, astConfig.VariableDeclarator)) return ast;
        return this.getSelectorThree().run(this.astI.getNowTokenType(), [ast]);
    }
    /**
     * 用于判断函数参数中拥有数组的约束
     */
    arrayPatternConstraint(elements) {
        // 当elements中的元素的类型不是 Identifier 报错
        // 当出现重复元素时报错
        const params = [];
        for (let index = 0; index < elements.length; index++) {
            if (!type.isType(elements[index].type, astConfig.Identifier) ||
                params.indexOf(elements[index].name) !== -1) {
                this.error.syntaxError();
            }
            params.push(elements[index].name);
        }
    }
    /**
     * 数组参数处理
     * @param {父节点} parentNode 
     */
    arrayElementAna(parentNode) {
        const elements = [];
        const select = this.getSelectorTwo();
        select.push(type.spread, "spreadAna").
            push(operator.sequenceOperator.comma, () => {
                return null;
            });
        do {
            elements.push(select.run(this.astI.getNowTokenType(), [parentNode]));
        } while (!this.astI.isType(brackets.middlebrackets.rightMiddlebrackets));
        return elements;
    }
    /**
     * 函数分析
     * @param {父节点,可以是一个数组} parentNode 
     */
    functionAna(parentNode) {
        let isSync = false;
        if(parentNode instanceof Array) {
            isSync = true
            parentNode = parentNode[0]
        }
        
        let ast = new astObj.FunctionExpression();
        // 判断 function 应该用的语法树
        if (type.isType(parentNode.type, [
            astConfig.Program,
            astConfig.WhileStatement,
            astConfig.DoWhileStatement,
            astConfig.IfStatement,
            astConfig.ForStatement,
            astConfig.SwitchCase,
            astConfig.WithStatement,
            astConfig.TryStatement
        ]) && !type.isType(this.astI.getFrontTokenType(), brackets.parentheses.leftParentheses)) {
            ast = new astObj.FunctionDeclaration();
        }
        if (type.isType(this.astI.getFrontTokenType(), brackets.parentheses.leftParentheses)) {
            ast.parenthesized =true;
        }
        if (this.astI.isType(jsKey["function*"])) {
            ast.generator = true;
        }

        if (type.isType(parentNode.type, astConfig.AsyncStatement) || isSync) {
            ast.async = true;
        }
        /**
         * function 开头
         * 首先向后平移 token (当前token类型为 function时)
         * 如果下一个 token 的类型不是 variableName 报错 （当父元素为 Program 类型时）
         * 再次向后平移 如果 token type 不是 （ 报错
         * 继续平移 如果不是 ) 就进入参数分析器
         */
        if (this.astI.isType([jsKey.function, jsKey["function*"]])) this.error.tokenAddOneAndUndefinedError();
        // 当父元素类型为 Program 函数必须要有 name 参数
        if (type.isType(ast.type, astConfig.FunctionDeclaration)) {
            this.error.nowTokenTypeError(type.variableName);
        }
        if (!this.astI.isType(brackets.parentheses.leftParentheses)) {
            ast.id = this.returnIdentifierAna();
        }
        this.error.nowTokenTypeError(brackets.parentheses.leftParentheses);
        this.error.tokenAddOneAndUndefinedError();
        // )
        if (!this.astI.isType(brackets.parentheses.rightParentheses)) {
            ast.params = this.functionParamAna(ast);
        }
        this.astI.removeRightParentheses();
        // 如果不是 { 报错
        this.error.nowTokenTypeError(brackets.braces.leftBraces);
        // 交给快处理器
        if (type.isType(parentNode.type, astConfig.MethodDefinition)) {
            ast.body = this.blockAna(parentNode);
        } else {
            ast.body = this.blockAna(ast);
        }
        return ast;
    }
    /**
     * 函数参数分析
     * @returns 返回一个数组里面存着
     * @param {父节点} parentNode 
     */
    functionParamAna(parentNode) {
        const params = [];
        const select = new selector(this);
        select.push(brackets.braces.leftBraces, "objectAna").
            push(brackets.middlebrackets.leftMiddlebrackets, "arrayAna").
            push(type.variableName, "variableNameAna").pushAfter(() => {
                if (this.astI.isType(operator.sequenceOperator.comma)) {
                    this.error.tokenAddOneAndUndefinedError();
                }
            }).
            // 用于判断 ...
            push(type.spread, "spreadAna", undefined, () => {
                if (!this.astI.isType(brackets.parentheses.rightParentheses))
                    this.error.syntaxError()
            }).
            pushDefaultRun(() => {
                this.error.syntaxError();
            });

        while (!type.isType(brackets.parentheses.rightParentheses, this.astI.getNowTokenType())) {
            const data = select.run(this.astI.getNowTokenType(), [parentNode]);
            params.push(this.assignmentExpressionToPattern(data));
        }
        return params;
    }
    /**
     * 用于处理函数中的 ...param
     * @param {父节点} parentNode
     */
    spreadAna(parentNode) {
        this.error.tokenAddOneAndUndefinedError();
        const select = new selector(this);
        const data = select.push(brackets.middlebrackets.leftMiddlebrackets, "arrayAna").
            push(type.variableName, "expressionAna").
            push(brackets.braces.leftBraces, "objectAna").
            pushDefaultRun(() => {
                this.error.syntaxError();
            }).run(this.astI.getNowTokenType(), [parentNode]);

        if (type.isType(parentNode, [astConfig.FunctionDeclaration, astConfig.FunctionExpression])) {
            if (!type.isType(data.type, [
                astConfig.Identifier,
                astConfig.ArrayPattern,
                astConfig.ObjectPattern
            ])) this.error.syntaxError();
            return new astObj.RestElement(data);
        }
        return new astObj.SpreadElement(data);
    }
    /**
     * 块分析 主要用于构造
     * BlockStatement 类
     * @param {父节点} parentNode 
     */
    blockAna(parentNode) {
        const ast = new astObj.BlockStatement();
        this.error.tokenAddOneAndUndefinedError();
        if (!this.astI.isType(brackets.braces.rightBraces)) {
            // 交给块类容处理器
            ast.body = this.blockContentAna(parentNode);
        }
        // 去掉最后的 }
        this.astI.lengthAddOne();
        return ast;
    }
    /**
     * 这个选择器针对于方法的身体和根元素的身体
     * @param {被填充内容的数组} body 
     */
    getSelectorOne(parentNode, body) {
        const select = new selector(this);
        select.push([jsKey.const, jsKey.var, jsKey.let], "variableKeyAna").
            push(jsKey.return, "returnAna").
            push([jsKey.function, jsKey["function*"]], "functionAna").
            push(this.getExpressionArray(), "rootNode").
            push(brackets.braces.leftBraces, "blockAna").
            push(jsKey.while, "whileAna").
            push(jsKey.do, "doWhileAna").
            push(jsKey.if, "ifAna").
            push(jsKey.class, "classAna").
            push([jsKey.yield, jsKey["yield*"]], "rootNode").
            push(jsKey.for, "forAna").
            push(jsKey.with, "withAna").
            push(jsKey.try, "tryAna").
            push(jsKey.super, "superAna").
            push(jsKey.export, "exportAna").
            push(jsKey.import, "importAna").
            push(jsKey.async, "asyncAna").
            push(jsKey.debugger, "debuggerAna").
            push(jsKey.switch, "switchAna").
            push(jsKey.throw, "throwAna").
            push([jsKey.break, jsKey.continue], "breakAndContinueAna").
            push(type.variableName, () => {
                // 用于判断标记
                if (type.isType(this.astI.getBehindTokenType(), operator.conditionalOperator.colon)) {
                    const ast = new astObj.LabeledStatement(this.astI.getNowTokenLexeme());
                    // 平移 token 到 : 之后
                    this.astI.lengthAddOne();
                    this.error.tokenAddOneAndUndefinedError();
                    ast.body = select.run(this.astI.getNowTokenType(), [parentNode]);
                    return ast;
                }
                if (type.isType(parentNode.type, astConfig.ForStatement))
                    return this.expressionAna(parentNode);
                return this.rootNode(parentNode);
            }).
            push(operator.sequenceOperator.comma, () => {
                let data = body.pop();
                // 逗号元素运行时前面必须有数据
                if (data) {
                    return this.inputSequenceAna(data);
                } else {
                    this.error.syntaxError();
                }
            }).
            push(operator.conditionalOperator.questionMark, () => {
                return this.inputConditionalAna(body.pop());
            }).
            push(type.arrowFunction, () => {
                // 交给箭头函数处理
                return this.inputArrowFunctionAna(body.pop());
            }).
            pushDefaultRun(() => {
                this.reservedAna();
                this.astI.lengthAddOne();
            });
        return select;
    }
    /**
     *  遇到保留关键字抛出错误
     */
    reservedAna() {
        if (this.astI.isType([
            jsKey.enum,
            jsKey.implements,
            jsKey.interface,
            jsKey.package,
            jsKey.private,
            jsKey.protected,
            jsKey.public,
        ])) {
            this.error.reservedError();
        }
    }
    /**
     * 块分析
     * @returns 数组
     * @param {父节点} parentNode 
     */
    blockContentAna(parentNode) {
        const body = [];
        const select = this.getSelectorOne(parentNode, body);
        // 循环当遇到 } 时退出
        while (!this.astI.isType(brackets.braces.rightBraces)) {
            const ast = select.run(this.astI.getNowTokenType(), [parentNode]);
            if (ast) body.push(ast);
        }
        return body;
    }
    /**
     * 用于对输入三元表达式的数据进行处理
     * @param {父节点} parentNode 
     */
    inputConditionalAna(parentNode) {
        const select = new selector(this);
        return select.push(astConfig.SequenceExpression, (node) => {
            const data = this.conditionalAna(node.expressions.pop());
            node.expressions.push(data);
            return node;
        }).push([astConfig.Identifier,
        astConfig.Literal,
        astConfig.BinaryExpression,
        astConfig.ArrowFunctionExpression,
        astConfig.FunctionExpression
        ], "conditionalAna").
            push(astConfig.ExpressionStatement, (node) => {
                const expression = node.expression;
                parentNode.expression = select.run(expression.type, [expression]);
                return parentNode;
            }).run(parentNode.type, [parentNode]);
    }
    /**
     * 三元表达式处理
     * @param {test 节点} parentNode 
     */
    conditionalAna(node) {
        const ast = new astObj.ConditionalExpression();
        ast.test = node;
        this.error.tokenAddOneAndUndefinedError();
        ast.consequent = this.expressionAna(ast);
        this.error.tokenAddOneAndUndefinedError();
        ast.alternate = this.expressionAna(ast);
        return ast;
    }

    /**
     * 逻辑表达式处理
     * @param {可能是左节点或者右节点} node 
     * @param {父节点} parentNode
     */
    logicalAna(parentNode, node) {
        let ast = new astObj.LogicalExpression(this.astI.getNowTokenLexeme());
        if (type.isType(parentNode.type, astConfig.LogicalExpression) &&
            type.isType(parentNode.operator, ["&&", this.astI.getNowTokenLexeme()])) {
            ast.left = parentNode.left;
            ast.operator = parentNode.operator;
            ast.right = node;
            parentNode.left = ast;
            parentNode.operator = this.astI.getNowTokenLexeme();
            this.error.tokenAddOneAndUndefinedError();
            return this.expressionAna(ast)
        }
        ast.left = node;
        this.error.tokenAddOneAndUndefinedError();
        ast.right = this.expressionAna(ast);
        return ast;
    }
    /**
     * 表达式处理 1+2+3
     * @param {父类型} parentNode 
     * @param {最后扫描到)是否平移 token} endParentheses
     */
    expressionAna(parentNode) {
        const opData = [];
        const suffixData = [];
        let goOut = false;

        const member = () => {
            if (type.isType(this.astI.getFrontTokenType(), brackets.parentheses.rightParentheses) &&
                suffixData.length > 0) return true;
            return false;
        }

        const select1 = new selector(this);
        select1.push(type.arrowFunction, () => {
            return this.arrowFunctionAna(parentNode, suffixData.pop());
        }).push(brackets.parentheses.leftParentheses, () => {
            if (member()) {
                return this.callAna(suffixData.pop());
            }
        }).push(brackets.middlebrackets.leftMiddlebrackets, () => {
            if (member()) {
                return this.arrMemberAna(suffixData.pop());
            }
        }).push(operator.memberOperator.spot, () => {
            if (member()) {
                return this.objMemberAna(suffixData.pop());
            }
        }).pushAfter((ast) => {
            // 当选择器处理数据不为空时添加数据到 suffixData
            if (ast[0]) {
                suffixData.push(ast[0]);
            }
            /**
            * 用于处理 opData中的符号
            * 当现在获取的符号优先级小于等于 opData 顶上的符号时 弹出 opData 中的符号到suffixData中
            * 当获取的符号优先级大于 opData 顶上的符号时添加符号到 suffixData 中
            */
            if (type.isBinaryOperator(this.astI.getNowTokenType()) ||
                this.astI.isType(jsKey.instanceof)) {
                const p1 = type.getPriority(this.astI.getNowTokenType());
                while (opData.length > 0) {
                    let op = opData.pop();

                    let p2 = type.getPriority(op.type);
                    // 判断当前符号优先级是否大于 opData 最顶上的符号
                    if (p1 > p2 || type.isType(op.type, brackets.parentheses.leftParentheses)) {
                        opData.push(op);
                        opData.push(this.astI.getNowToken());
                        break;
                    }
                    suffixData.push(op);
                }
                if (opData.length === 0) {
                    opData.push(this.astI.getNowToken());
                }
                this.astI.lengthAddOne();
            } else {
                goOut = true;
            }
        });

        const opAna = (ast) => {
            
            if (goOut) return;

            if (ast.length > 0) suffixData.push(ast[0]);

            if (this.astI.isType(brackets.parentheses.rightParentheses)) return;

            if (this.astI.isType(operator.sequenceOperator.comma)) {
                goOut = true;
                return;
            }
            select1.run(this.astI.getNowTokenType());
        }
        /**
         * 用于构建表达式选择器
         */
        const select = new selector(this);
        
        this.selectLiteral(select).push([type.variableName,jsKey.import], "variableNameAna").push([
            // 用于处理 ++ --
            operator.updateOperator.addOne,
            operator.updateOperator.reduceOne
        ], () => this.updateAna(parentNode, true)).
            push(brackets.parentheses.leftParentheses, () => {
                // 用递归的模式处理( 中的数据
                this.error.tokenAddOneAndUndefinedError();
                const data = this.expressionAna(parentNode);
                if (data) suffixData.push(data);
                // 当扫描为 , 时启动 sequenceAna 处理
                if (this.astI.isType(operator.sequenceOperator.comma)) {
                    this.error.tokenAddOneAndUndefinedError();
                    suffixData.push(this.sequenceAna(suffixData.pop()));
                }
                // 当为 ) 时数据处理
            }).push(brackets.parentheses.rightParentheses, () => {
                this.astI.lengthAddOne();
                if (!this.astI.isType([type.arrowFunction,
                brackets.parentheses.leftParentheses,
                brackets.middlebrackets.leftMiddlebrackets,
                operator.memberOperator.spot]) &&
                    !type.isBinaryOperator(this.astI.getNowTokenType()) &&
                    !type.isAssignmentOperator(this.astI.getNowTokenType())) {
                    this.astI.lengthReduceOne();
                }
                goOut = true;
            }).
            push(jsKey.undefined, "returnIdentifierAna").
            push([jsKey.function, jsKey["function*"]], "functionAna").
            push(jsKey.new, "newAna").
            push(jsKey.class, "classAna").
            // 当前token 类型为 add 或者 reduce 时处理。
            // 因为当是这两种情况时有可能是负数或者正数
            // 或者当为非或逻辑非是处理
            push(this.getUnaryArray(), () => {
                const tree = this.unaryAna(parentNode);
                return tree ? tree : this.error.syntaxError();
            }).push(brackets.braces.leftBraces, "objectAna").
            push([operator.sequenceOperator.comma, type.semicolon, brackets.braces.rightBraces], () => {
                // 当为, 和; 时退出
                goOut = true;
            }).
            push(type.spread, "spreadAna").
            push(jsKey.await, "awaitAna").
            push(brackets.middlebrackets.leftMiddlebrackets, "arrayAna").
            push(jsKey.this, "thisAna").
            pushDefaultRun(() => {
                this.error.syntaxError();
            }).pushAfter(opAna);

        // 对数据进行递归处理
        const dataAna = () => {
            select.run(this.astI.getNowTokenType(), [parentNode]);
            if (goOut) return;
            dataAna();
        }
        // 用于执行递归函数用后缀表达式的方式分析表达式
        dataAna();

        while (opData.length > 0) {
            suffixData.push(opData.pop())
        }

        let returnData = null;
        // 当表达式没有数据时报错
        if (suffixData.length === 0 && !this.astI.isType(type.arrowFunction)) {
            this.error.syntaxError();
        } else if (suffixData.length === 1) {
            returnData = suffixData[0];
        } else {
            // 将后缀表达式转换为语法树
            // 遇到小树 添加到 opData 遇到 符号在 opData 中提取栈尾两个元素进行运算
            for (let index = 0; index < suffixData.length; index++) {
                const element = suffixData[index];
                if (type.isBinaryOperator(element.type) ||
                    type.isType(element.type, jsKey.instanceof)) {
                    const right = opData.pop();
                    const left = opData.pop();
                    opData.push(new astObj.BinaryExpression(left, element.lexeme, right));
                } else {
                    opData.push(element);
                }
            }
            returnData = opData[0];
        }
        // 用于判断三元表达式。
        if (this.astI.isType(operator.conditionalOperator.questionMark)) {
            returnData = this.conditionalAna(returnData);
            // 用于处理逻辑表达式
        } else if (type.isLogicalOperator(this.astI.getNowTokenType())) {
            returnData = this.logicalAna(parentNode, returnData);
        }
        return returnData;
    }
    /**
     * 获取用一元表达式处理的数组
     */
    getUnaryArray() {
        return [
            jsKey.delete,
            operator.binaryOperator.add,
            operator.binaryOperator.reduce,
            operator.unaryOperator.inverse,
            operator.unaryOperator.logicInverse,
            jsKey.typeof,
            jsKey.void
        ]
    }
    /**
     * 用于处理字符串和数字 true null false
     */
    returnLiteralAna() {
        this.astI.lengthAddOne();
        const ast = new astObj.Literal(this.astI.getFrontTokenLexeme());
        return this.getSelectorThree().run(this.astI.getNowTokenType(), [ast]);;
    }
    /**
     * 返回一个 Identifier 对象
     */
    returnIdentifierAna() {
        this.astI.lengthAddOne();
        return new astObj.Identifier(this.astI.getFrontTokenLexeme());
    }

    /**
     * 用于选择所有 Literal 元素
     * @param {selector 选择器} select 
     */
    selectLiteral(select) {
        return select.push([type.number,
        type.characterString,
        jsKey.true,
        jsKey.false,
        jsKey.null,
        type.regular
        ], "returnLiteralAna")
    }
    /**
     * 用于选择需要用 expressionAna 分析器分析的类型
     */
    getExpressionArray() {
        return [
            brackets.parentheses.leftParentheses,
            brackets.middlebrackets.leftMiddlebrackets,
            type.variableName,
            type.number,
            type.characterString,
            type.regular,
            jsKey.false,
            jsKey.undefined,
            jsKey.null,
            jsKey.this,
            jsKey.new,
            jsKey.typeof,
            jsKey.void,
            jsKey.await,
            jsKey.delete,
            operator.unaryOperator.inverse,
            operator.unaryOperator.logicInverse,
            operator.binaryOperator.add,
            operator.binaryOperator.reduce,
        ];
    }
    /**
     * 正负号处理
     * @param {父类型} parentNode 
     */
    unaryAna(parentNode) {
        const frontType = this.astI.getFrontTokenType();
        let ast = undefined;

        // 判断符号前面是否为特定token
        if (!frontType || type.isAncestor(frontType, operator) ||
            type.isAncestor(frontType, brackets) ||
            type.isType(frontType, [
                type.semicolon,
                type.arrowFunction,
                jsKey.return,
                jsKey.yield,
                jsKey["yield*"]])) {

            ast = new astObj.UnaryExpression(this.astI.getNowTokenLexeme());
            this.error.tokenAddOneAndUndefinedError();
            ast.argument = this.getSelectorFive().
                run(this.astI.getNowTokenType(), [parentNode]);
        }
        return ast;
    }
    /**
     * 第五个选择器用于处理后面接一个元素的情况
     */
    getSelectorFive() {
        const select = new selector(this);
        this.selectLiteral(select).
            push(type.variableName, "variableNameAna").
            push(brackets.parentheses.leftParentheses, "expressionAna", () => {
                this.astI.lengthAddOne();
            }, () => {
                this.astI.removeRightParentheses();
            }).
            push(brackets.middlebrackets.leftMiddlebrackets, "arrayAna").
            push(brackets.braces.leftBraces, "objectAna").
            push(this.getUnaryArray(), "unaryAna").
            push([jsKey.function, jsKey["function*"]], "functionAna").
            push(jsKey.new, "newAna").
            push(jsKey.this, "thisAna").
            push(jsKey.await, "awaitAna").
            push(jsKey.async, "asyncAna").
            push(jsKey.import, "importAna");
        return select;
    }
    /**
     * 处理 ++ 或 --
     * @param {用于标示++ 或 -- 在前面或者后面} prefix 
     * @param {父标签} parentNode 
     */
    updateAna(parentNode, prefix) {
        const ast = new astObj.UpdateExpression(this.astI.getNowTokenLexeme(), prefix);
        if (prefix) {
            this.error.tokenAddOneAndUndefinedError();
            this.error.nowTokenTypeError(type.variableName);
            const tree = this.variableNameAna(ast);
            this.error.tokenTypeError(tree.type, astConfig.Identifier);
            ast.argument = tree;
        } else {
            ast.argument = parentNode;
        }
        this.astI.lengthAddOne();
        return ast;
    }

    /**
     * 用于处理返回语句
     * @param {父节点} parentNode 
     */
    returnAna(parentNode) {
        const ast = new astObj.ReturnStatement();
        if (type.isType(this.astI.getBehindOneTokenType(), [type.lineFeed, type.semicolon])) {
            this.astI.lengthAddOne();
            return ast;
        }
        this.astI.lengthAddOne();
        ast.argument = this.isSequenceAna(this.expressionAna(ast));
        return ast;
    }
    /**
     * 用于分析 this
     * @param {父节点} parentNode
     */
    thisAna(parentNode) {
        this.astI.lengthAddOne();
        const ast = new astObj.ThisExpression();
        return this.getSelectorThree().
            pushDefaultRun(() => {
                return ast;
            }).run(this.astI.getNowTokenType(), [ast]);
    }
    /**
     * 用于判断node后是否跟着,号 如果跟着,调用 sequenceAna 处理
     * @param {节点} node 
     */
    isSequenceAna(node) {
        if (this.astI.isType(operator.sequenceOperator.comma)) {
            node = this.inputSequenceAna(node);
        }
        return node;
    }
    /**
     * 第四个选择器用于关键字处理
     * @param {父节点} parentNode 
     */
    getSelectorFour(parentNode) {
        const select = this.getSelectorOne(parentNode, []);
        return select.push([jsKey.function, jsKey["function*"]], () => {
            this.error.syntaxError();
        }).push(brackets.parentheses.rightParentheses, () => {
            this.error.tokenAddOneAndUndefinedError();
        }).push(type.semicolon, "emptyAna").
            push([jsKey.break, jsKey.continue], "breakAndContinueAna").
            pushDefaultRun(() => {
                this.error.syntaxError();
            });
    }
    /**
     * 用于分析if语句
     * @param {父节点} parentNode 
     */
    ifAna(parentNode) {
        const ast = new astObj.IfStatement();
        const select = this.getSelectorFour(ast);
        this.error.tokenAddOneAndUndefinedError();
        this.error.nowTokenTypeError(brackets.parentheses.leftParentheses);
        this.error.tokenAddOneAndUndefinedError();
        ast.test = this.isSequenceAna(this.expressionAna(ast));
        this.astI.removeRightParentheses();
        ast.consequent = this.isSequenceAna(select.run(this.astI.getNowTokenType(),[ast]));

        if (this.astI.isType(jsKey.else)) {
            this.error.tokenAddOneAndUndefinedError();
            if (this.astI.isType(brackets.braces.leftBraces)) {
                ast.alternate = this.blockAna(ast);
            } else if (this.astI.isType(jsKey.if)) {
                ast.alternate = this.ifAna(ast);
            } else {
                ast.alternate = this.isSequenceAna(select.run(this.astI.getNowTokenType()));
            }
        }
        return ast;
    }
    /**
     * 空语句
     */
    emptyAna() {
        this.astI.lengthAddOne();
        return new astObj.EmptyStatement();
    }
    /**
     * 关键字 new 处理
     * @param {父节点} parentNode 
     */
    newAna(parentNode) {
        const ast = new astObj.NewExpression();
        this.error.tokenAddOneAndUndefinedError();
        const select = this.getSelectorFive();
        select.push(this.getUnaryArray(), () => {
            this.error.syntaxError();
        })
        const data = select.run(this.astI.getNowTokenType(), [ast]);
        ast.callee = data;
        if (type.isType(data.type, astConfig.CallExpression)) {
            ast.arguments = data.arguments;
            ast.callee = data.callee;
        }
        return ast;
    }
    /**
     * while 处理
     * @param {父节点} parentNode 
     */
    whileAna(parentNode) {
        const ast = new astObj.WhileStatement();
        const select = this.getSelectorFour(ast);
        this.error.tokenAddOneAndUndefinedError();
        this.error.nowTokenTypeError(brackets.parentheses.leftParentheses);
        this.error.tokenAddOneAndUndefinedError();
        ast.test = this.isSequenceAna(this.expressionAna(ast));
        this.astI.removeRightParentheses();
        ast.body = this.isSequenceAna(select.run(this.astI.getNowTokenType(), [ast]));
        return ast;
    }

    /**
     * 用于分析 do while 语句
     * @param {父节点} parentNode 
     */
    doWhileAna(parentNode) {
        const ast = new astObj.DoWhileStatement();
        const select = this.getSelectorFour(ast);
        this.error.tokenAddOneAndUndefinedError();
        ast.body = this.isSequenceAna(select.run(this.astI.getNowTokenType(), [ast]));
        this.error.nowTokenTypeError(jsKey.while);
        this.error.tokenAddOneAndUndefinedError();
        this.error.nowTokenTypeError(brackets.parentheses.leftParentheses);
        this.error.tokenAddOneAndUndefinedError();
        ast.test = this.isSequenceAna(this.expressionAna(ast));

        this.astI.removeRightParentheses();
        return ast;
    }
    /**
     * break和continue分析
     */
    breakAndContinueAna() {
        let ast = new astObj.ContinueStatement();
        if (this.astI.isType(jsKey.break)) {
            ast = new astObj.BreakStatement();
        }
        if (type.isType(this.astI.getBehindOneTokenType(), type.variableName)) {
            this.astI.lengthAddOne();
            ast.label = this.returnIdentifierAna();
            return ast;
        }
        this.astI.lengthAddOne();
        return ast;
    }

    /**
     * 用于处理 for 语句
     * @param {父节点} parentNode 
     */
    forAna(parentNode) {
        let paramOne = null;
        let paramTwo = null;
        let ast = new astObj.ForStatement();
        const select = this.getSelectorFour(ast);
        // 初始化分析器当遇到 { 时为对象分析器
        select.push(brackets.braces.leftBraces, "objectAna");
        this.error.tokenAddOneAndUndefinedError();
        this.error.nowTokenTypeError(brackets.parentheses.leftParentheses);
        this.error.tokenAddOneAndUndefinedError();

        if (!this.astI.isType(type.semicolon)){
            paramOne = this.isSequenceAna(select.run(this.astI.getNowTokenType(), [ast]));
            this.astI.removeRightParentheses();
        }
            
        // 用于选着合适的for分析对象
        if (this.astI.isType(jsKey.in)) 
            ast = new astObj.ForInStatement();
        if (this.astI.isType(jsKey.of)) ast = new astObj.ForOfStatement();

        if (!type.isType(ast.type, astConfig.ForStatement) &&
            (!paramOne || !type.isType(paramOne.type, [astConfig.VariableDeclaration, astConfig.Identifier]))) {
            this.error.syntaxError();
        }
        this.astI.lengthAddOne();
        if (!this.astI.isType(type.semicolon)){
            paramTwo = this.isSequenceAna(select.run(this.astI.getNowTokenType(), [ast]));
            this.astI.removeRightParentheses();
        }
        // 当后面的数据是 ; 向后平移
        if (this.astI.isType(type.semicolon)) {
            this.error.tokenAddOneAndUndefinedError();
        }

        if (type.isType(ast.type, astConfig.ForStatement)) {
            ast.init = paramOne;
            ast.test = paramTwo;
            if (!this.astI.isType(brackets.parentheses.rightParentheses))
                ast.update = this.isSequenceAna(select.run(this.astI.getNowTokenType(), [ast]));
        } else {
            ast.left = paramOne;
            ast.right = paramTwo;
        }
        // 当后面的数据是 ) 向后平移
        this.astI.removeRightParentheses();
        // 最后当遇到 { 调整分析器为块分析器
        select.push(brackets.braces.leftBraces, "blockAna");
        ast.body = this.isSequenceAna(select.run(this.astI.getNowTokenType(), [ast]));
        return ast;
    }
    /**
     * 用于处理 switch 语句
     * @param {父节点} parentNode 
     */
    switchAna(parentNode) {
        const ast = new astObj.SwitchStatement();
        const select = this.getSelectorOne(ast, []);
        select.push(type.semicolon, "emptyAna")
        /**
         * 用于处理 case 下面的语句
         */
        const consequentAna = () => {
            const consequents = [];

            while (!this.astI.isType([jsKey.case, jsKey.default, brackets.braces.rightBraces])) {
                consequents.push(this.isSequenceAna(select.run(this.astI.getNowTokenType(), [ast])));
                if (this.astI.isType(type.semicolon)) this.astI.lengthAddOne();
            }
            return consequents;
        }
        /**
         * 用于处理switch 中的 case
         */
        const caseAna = () => {
            const cases = [];
            while (!this.astI.isType(brackets.braces.rightBraces)) {
                if (this.astI.isType([jsKey.case, jsKey.default])) {
                    const tree = new astObj.SwitchCase();
                    this.error.tokenAddOneAndUndefinedError();
                    if (type.isType(this.astI.getFrontTokenType(), jsKey.case)) {
                        tree.test = this.isSequenceAna(this.expressionAna(ast));
                    }
                    this.error.tokenAddOneAndUndefinedError();
                    tree.consequent = consequentAna();
                    cases.push(tree);
                } else {
                    this.error.syntaxError();
                }
            }
            return cases;
        }
        this.error.tokenAddOneAndUndefinedError();
        this.error.nowTokenTypeError(brackets.parentheses.leftParentheses);
        this.error.tokenAddOneAndUndefinedError();
        ast.discriminant = this.isSequenceAna(this.expressionAna(ast));
        this.astI.removeRightParentheses();
        this.error.nowTokenTypeError(brackets.braces.leftBraces);
        this.error.tokenAddOneAndUndefinedError();
        ast.cases = caseAna(ast);
        this.astI.lengthAddOne();
        return ast;
    }
    /**
     * 用于分析 yield 关键字
     * @param {父节点} parentNode 
     */
    yieldAna(parentNode) {
        if (!parentNode.generator) this.error.reservedError();
        const ast = new astObj.YieldExpression();
        if (this.astI.isType(jsKey["yield*"])) ast.delegate = true;
        if (type.isType(this.astI.getBehindOneTokenType(), [type.lineFeed, type.semicolon])) {
            this.astI.lengthAddOne();
            return ast;
        }
        this.astI.lengthAddOne();
        ast.argument = this.isSequenceAna(this.expressionAna(parentNode));
        return ast;
    }

    /**
     * 用于分析 with
     * @param {父节点} parentNode 
     */
    withAna(parentNode) {
        const select = this.getSelectorFour(this);
        const ast = new astObj.WithStatement();
        this.error.tokenAddOneAndUndefinedError();
        this.error.nowTokenTypeError(brackets.parentheses.leftParentheses);
        this.error.tokenAddOneAndUndefinedError();
        ast.object = this.isSequenceAna(this.expressionAna(ast));
        this.astI.removeRightParentheses();

        ast.body = this.isSequenceAna(select.run(this.astI.getNowTokenType(), [ast]));
        return ast;
    }
    /**
     * 用于分析 async
     * @param {父节点} parentNode
     */
    asyncAna(parentNode) {
        let ast = this.returnIdentifierAna();
        const select = this.getSelectorThree().pushDefaultRun(() => undefined);
        let data = select.run(this.astI.getNowTokenType(), [ast]);
        if (data) {
            if (type.isType(data.type, astConfig.CallExpression) &&
                this.astI.isType(type.arrowFunction)) {
                data = this.arrowFunctionAna(new astObj.AsyncStatement(),data.arguments);
            }
            return data;
        }
        if (type.isType(parentNode.type, [astConfig.ObjectExpression
            ,astConfig.MethodDefinition, astConfig.Program])) {
            ast = this.functionAna([parentNode, new astObj.AsyncStatement()]);
        } else {
            ast = this.expressionAna(new astObj.AsyncStatement());
        }

        if (!type.isType(ast.type, [astConfig.ArrowFunctionExpression,
        astConfig.FunctionDeclaration,
        astConfig.FunctionExpression])) this.error.syntaxError();

        return ast;
    }

    /**
     * 用于处理 await 表达式
     * @param {父节点} parentNode 
     */
    awaitAna(parentNode) {
        const select = this.getSelectorFive();
        if (!parentNode.async) this.error.syntaxError();
        this.error.tokenAddOneAndUndefinedError();
        const ast = new astObj.AwaitExpression();
        ast.argument = select.run(this.astI.getNowTokenType(), [parentNode]);
        return ast;
    }
    /**
     * 调试语句分析
     */
    debuggerAna(){
        this.astI.lengthAddOne();
        return new astObj.DebuggerStatement();
    }

    /**
     * 用于抛出异常
     * @param {父节点} parentNode 
     */
    throwAna(parentNode){
        const ast = new astObj.ThrowStatement();
        this.error.tokenAddOneAndUndefinedError();
        ast.argument = this.isSequenceAna(this.expressionAna(ast));
        return ast;
    }
    /**
     * 用于处理
     * @param {父节点} parentNode 
     */    
    tryAna(parentNode){
        // catch 中的参数选择器
        const select = new selector(this);
        select.push([type.variableName, jsKey.undefined], "returnIdentifierAna").
            push(brackets.braces.leftBraces, "objectAna").
            push(brackets.middlebrackets.leftMiddlebrackets, "arrayAna").
            pushDefaultRun(() => {
                this.error.syntaxError();
            });
        /**
         * 用于处理 try 语句中的 catch 分支
         */
        const catchAna = ()=>{
            const tree = new astObj.CatchClause();
            this.error.tokenAddOneAndUndefinedError();
            this.error.nowTokenTypeError(brackets.parentheses.leftParentheses);
            this.error.tokenAddOneAndUndefinedError();
            tree.param = select.run(this.astI.getNowTokenType(),[ast]);
            this.error.tokenAddOneAndUndefinedError();
            tree.body = this.blockAna(ast);
            return tree;
        }   
        /**
         * 用于处理 try 语句中的 finally 分支
         */
        const finallyAna = ()=>{
            this.error.tokenAddOneAndUndefinedError();
            this.error.nowTokenTypeError(brackets.braces.leftBraces);
            return this.blockAna(ast);
        }

        const ast = new astObj.TryStatement();
        this.error.tokenAddOneAndUndefinedError();

        this.error.nowTokenTypeError(brackets.braces.leftBraces);
        ast.block = this.blockAna(ast);

        if(this.astI.isType(jsKey.catch)) {
            ast.handler = catchAna();
        }
        if(this.astI.isType(jsKey.finally)) {
            ast.finalizer = finallyAna();
        }

        if(!ast.handler&&!ast.finalizer) {
            this.error.syntaxError();
        }
        return ast;
    }
    /**
     * 用于分析 class 语句
     * @param {父节点} parentNode 
     */
    classAna(parentNode){
        const selectBody =new selector(this);
        selectBody.push(jsKey.static,(method)=>{
            method.static = true;
            this.astI.lengthAddOne();
            if(this.astI.isType(jsKey.async)) {
                asyncFunAna(method);
            } else if (this.astI.isType(type.variableName)){
                method.key = this.returnIdentifierAna();
                method.value = this.functionAna(method);
            } else {
                this.error.syntaxError();
            }
        }).push(type.variableName, (method) => {
            if (this.astI.getNowTokenLexeme() === "constructor") {
                method.kind = "constructor";
            }
            method.key = this.returnIdentifierAna();
            method.value = this.functionAna(method);
        }).push(jsKey.async, (method) => {
            asyncFunAna(method);
        })
        const asyncFunAna = (method)=>{
            this.error.tokenAddOneAndUndefinedError();
            if (this.astI.isType(type.variableName)) {
                method.key = new astObj.Identifier(this.astI.getNowTokenLexeme());
                this.astI.lengthReduceOne();
                method.value = this.asyncAna(method);
            } else if (this.astI.isType(brackets.parentheses.leftParentheses)) {
                this.astI.lengthReduceOne();
                method.key = this.returnIdentifierAna();
                method.value = this.functionAna(method);
            } else {
                this.error.syntaxError();
            }
        }
        /**
         * class body 分析
         */
        const classBodyAna = ()=>{
            const tree = new astObj.ClassBody();
            while(!this.astI.isType(brackets.braces.rightBraces)) {
                const method = new astObj.MethodDefinition();
                selectBody.run(this.astI.getNowTokenType(),[method]);
                tree.body.push(method);
            }
            return tree;
        }
        // 用于处理类继承的选择器
        const select = new selector(this);
        select.push(type.variableName, "returnIdentifierAna").
            push([jsKey.function, jsKey["function*"]], "functionAna").
            push(brackets.middlebrackets.leftMiddlebrackets,"arrayAna").
            push(brackets.braces.leftBraces, "objectAna").
            push(jsKey.async, "asyncAna").
            pushDefaultRun(()=>{
                this.error.syntaxError();
            });
        let ast = new astObj.ClassDeclaration();
        if (type.isType(parentNode.type, [astConfig.VariableDeclarator, astConfig.AssignmentExpression])) {
            ast = new astObj.ClassExpression();
        }
        this.error.tokenAddOneAndUndefinedError();
        if(this.astI.isType(type.variableName)) {
            ast.id = this.returnIdentifierAna();
            if (this.astI.isType(jsKey.extends)) {
                this.error.tokenAddOneAndUndefinedError();
                ast.superClass = select.run(this.astI.getNowTokenType(),[ast]);
            }
        }
        this.error.nowTokenTypeError(brackets.braces.leftBraces);
        this.error.tokenAddOneAndUndefinedError();
        ast.body = classBodyAna();
        this.astI.lengthAddOne();
        return ast;
    }
    /**
     * super 处理
     * @param {父节点} parentNode 
     */
    superAna(parentNode){
        this.astI.lengthAddOne();
        const ast = new astObj.Super();
        return this.getSelectorThree().
            push(brackets.parentheses.leftParentheses, (ast)=>{
                if (parentNode.kind !== "constructor")
                    this.error.syntaxError();
                return this.callAna(ast);
            }).
            pushDefaultRun(() => {
                this.error.syntaxError();
            }).run(this.astI.getNowTokenType(), [ast]);
    }
    /**
     * 导出处理
     * @param {父节点} parentNode 
     */
    exportAna(parentNode){
        if(!type.isType(parentNode.type,astConfig.Program)) {
            this.error.syntaxError();
        }
        const select = new selector(this);
        select.push([jsKey.function,jsKey["function*"]],()=>{
            ast.declaration = this.functionAna(ast);
        }).push([jsKey.var,jsKey.const,jsKey.let],()=>{
            ast.declaration = this.variableKeyAna(ast);
        }).push(jsKey.class,()=>{
            ast.declaration = this.classAna(ast);
        }).push(brackets.braces.leftBraces,()=>{
            this.error.tokenAddOneAndUndefinedError();
            while(!this.astI.isType(brackets.braces.rightBraces)) {
                const tree = new astObj.ExportSpecifier();
                ast.specifiers.push(tree);
                tree.local = this.returnIdentifierAna();
                if(this.astI.isType(jsKey.as)){
                    this.error.tokenAddOneAndUndefinedError();
                    tree.exported = this.returnIdentifierAna();
                } else {
                    tree.exported = tree.local;
                }
                if (this.astI.isType(operator.sequenceOperator.comma)) {
                    this.error.tokenAddOneAndUndefinedError();
                }
            }
            this.astI.lengthAddOne();
            ast.source = this.fromAna();
        }).push(jsKey.default,()=>{
            ast = new astObj.ExportDefaultDeclaration();
            this.error.tokenAddOneAndUndefinedError();
            if(this.astI.isType(jsKey.class)) {
                ast.declaration = this.classAna(ast)
            } else {
                ast.declaration = this.expressionAna(ast);
            }
        }).push(operator.binaryOperator.ride,()=>{
            ast = new astObj.ExportAllDeclaration();
            this.error.tokenAddOneAndUndefinedError();
            if (this.astI.isType(jsKey.as)) {
                this.error.tokenAddOneAndUndefinedError();
                this.error.nowTokenTypeError(type.variableName);
                ast.exported = this.returnIdentifierAna();
            }
            ast.source = this.fromAna();
        }).pushDefaultRun(()=>{
            this.error.syntaxError();
        });

        let ast = new astObj.ExportNamedDeclaration();
        this.error.tokenAddOneAndUndefinedError();
        select.run(this.astI.getNowTokenType(),[ast]);
        return ast;
    }
    /**
     * from 分析
     */
    fromAna(){
        if(!this.astI.isType(jsKey.from)) {
            return null;
        }
        this.error.tokenAddOneAndUndefinedError();
        this.error.nowTokenTypeError(type.characterString);
        return this.returnLiteralAna();
    }
    /**
     * 分析 import
     * @param {父节点} parentNode 
     */
    importAna(parentNode){
        const specifierAna = ()=>{
            this.error.tokenAddOneAndUndefinedError();
            const specifiers = [];
            while(!this.astI.isType(brackets.braces.rightBraces)) {
                const specifier = new astObj.ImportSpecifier();
                specifiers.push(specifier);
                specifier.imported = this.returnIdentifierAna();
                if(this.astI.isType(jsKey.as)) {
                    this.error.tokenAddOneAndUndefinedError();
                    specifier.local = this.returnIdentifierAna();
                } else {
                    specifier.local = specifier.imported;
                }
                if (this.astI.isType(operator.sequenceOperator.comma)) {
                    this.error.tokenAddOneAndUndefinedError();
                } 
            }
            this.astI.lengthAddOne();
            return specifiers;
        }
        const select = new selector(this);
        select.push(type.variableName,()=>{
            const tree = new astObj.ImportDefaultSpecifier();
            tree.local = this.returnIdentifierAna();
            ast.specifiers.push(tree);
            if (this.astI.isType(operator.sequenceOperator.comma)) {
                this.error.tokenAddOneAndUndefinedError();
                if (this.astI.isType(brackets.braces.leftBraces)) {
                    const specifiers = specifierAna();
                    ast.specifiers = [tree, ...specifiers];
                } else {
                    select.run(this.astI.getNowTokenType());
                    return;
                }
            }
            ast.source = this.fromAna();
            if (!ast.source) this.error.syntaxError();
        }).push(operator.binaryOperator.ride,()=>{
            const tree = new astObj.ImportNamespaceSpecifier();
            this.error.tokenAddOneAndUndefinedError();
            this.error.nowTokenTypeError(jsKey.as);
            this.error.tokenAddOneAndUndefinedError();
            tree.local = this.returnIdentifierAna();
            ast.specifiers.push(tree);
            ast.source = this.fromAna();
            if(!ast.source) this.error.syntaxError();
        }).push(brackets.braces.leftBraces,()=>{
            ast.specifiers = specifierAna();
            ast.source = this.fromAna();
            if(!ast.source) this.astI.syntaxError();
        }).push(type.characterString,()=>{
            ast.source=this.returnIdentifierAna();
        }).push(brackets.parentheses.leftParentheses,()=>{
            ast = new astObj.ExpressionStatement();
            this.astI.lengthReduceOne();
            ast.expression = this.isSequenceAna(this.expressionAna(ast));

        }).pushDefaultRun(()=>{
            this.error.syntaxError();
        });
        let ast = new astObj.ImportDeclaration();
        this.error.tokenAddOneAndUndefinedError();
        select.run(this.astI.getNowTokenType());
        return ast;
    }
}   