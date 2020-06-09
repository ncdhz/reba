const rebaTools = require("reba-tools");
const astConfig = require("reba-parser-tools").config;
const type = rebaTools.type;
const jsKey = type.jsKey;
const typeCode = rebaTools.typeCode;
const operator = typeCode.operator;
const brackets = typeCode.brackets;

module.exports = class {
    /**
     * 把遍历器添加到此对象
     * @param {遍历器} select
     */
    constructor(select, code) {
        this.code = code;
        this.select = select;
    }

    Program(ast) {
        this.selectForRun(ast.body, ast);
    }

    /**
     * 用于选择当前语法树构建器
     * @param {语法树} element 
     */
    selectRun(element, parentNode) {
        if (element)
            this.select.run(element.type, [element, parentNode]);
    }
    /**
     * 用于处理数组遍历选择
     * @param {需要遍历的数组} element 
     * @param {回调函数 其中有参数遍历数组的编号} callback 
     */
    selectForRun(element, parentNode, callback) {
        for (let index = 0; index < element.length; index++) {
            this.selectRun(element[index], parentNode);
            if (callback) {
                callback(index);
            }
        }
    }
    /**
     * 变量声明
     * @param {语法树} ast 
     */
    VariableDeclaration(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.addBehindSpace(ast.kind);
        this.selectForRun(ast.declarations, ast, (index) => {
            this.code.addCommaExceptEndNode(index, ast.declarations.length);
        });
        this.code.addSemicolon();
    }
    /**
     * 表达式语句
     * @param {语法树} ast 
     */
    ExpressionStatement(ast, parentNode) {
        this.selectRun(ast.expression, parentNode);
        this.code.addSemicolon();
    }
    /**
     * 等式分析
     * @param {语法树} ast 
     */
    AssignmentExpression(ast, parentNode) {
        this.code.spaceAlignment();
        this.selectRun(ast.left, ast);
        this.code.addFrontBehindSpace(ast.operator);
        this.selectRun(ast.right, ast);
    }
    /**
     * 变量声明器
     * @param {语法树} ast 
     */
    VariableDeclarator(ast, parentNode) {
        this.selectRun(ast.id, ast);
        this.code.addFrontBehindSpace(operator.assignmentOperator.equal);
        this.selectRun(ast.init, ast);
    }
    /**
     * 用于函数部分处理
     * @param {语法树} ast 
     */
    FunctionDeclaration(ast, parentNode) {
        this.Function(ast, parentNode);
    }
    Function(ast, parentNode) {
        if (ast.parenthesized) {
            this.code.add(brackets.parentheses.leftParentheses);
        }
        if (!type.isType(parentNode.type, [
            astConfig.Property, astConfig.MethodDefinition
        ])) {
            this.code.spaceAlignment();
        }
        if (ast.async) {
            this.code.addBehindSpace(jsKey.async);
        }
        if (!type.isType(parentNode.type, [
            astConfig.Property, astConfig.MethodDefinition
        ])) {
            if (ast.generator) {
                this.code.addBehindSpace(jsKey["function*"]);
            } else {
                this.code.addBehindSpace(jsKey.function);
            }
        }
        this.selectRun(ast.id, ast);
        this.code.add(brackets.parentheses.leftParentheses);
        this.selectForRun(ast.params, ast, (index) => {
            this.code.addCommaExceptEndNode(index, ast.params.length);
        });
        this.code.addExceptEnter(brackets.parentheses.rightParentheses).addSpace();
        this.selectRun(ast.body, ast);
        if (ast.parenthesized) {
            this.code.addExceptEnter('').addBehindEnter(brackets.parentheses.rightParentheses);
            
        }
    }
    /**
     * 用于处理 function
     * @param {语法树} ast 
     */
    FunctionExpression(ast, parentNode) {
        this.Function(ast, parentNode);
    }
    /**
     * 用于处理block
     * @param {语法树} ast 
     */
    BlockStatement(ast, parentNode) {
        if (ast.body.length > 0) {
            this.code.addBehindEnter(brackets.braces.leftBraces);
            this.code.addSpaceNum();
            this.selectForRun(ast.body, ast);
            this.code.reduceSpaceNum();
            this.code.spaceAlignment().addBehindEnter(brackets.braces.rightBraces);
        } else {
            this.code.addBehindSpace(brackets.braces.leftBraces);
            this.code.addBehindEnter(brackets.braces.rightBraces);
        }
    }
    /**
     * 对标识符进行处理
     * @param {语法树} ast 
     */
    Identifier(ast, parentNode) {
        this.code.add(ast.name);
    }
    /**
     * 直接添加当前树value
     * @param {语法树} ast 
     */
    Literal(ast, parentNode) {
        this.code.add(ast.value);
    }

    /**
     * 二元表达式
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    BinaryExpression(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.add(brackets.parentheses.leftParentheses);
        this.selectRun(ast.left, ast);
        this.code.addFrontBehindSpace(ast.operator);
        this.selectRun(ast.right, ast);
        this.code.addExceptEnter(brackets.parentheses.rightParentheses);
    }

    /**
     * 条件表达式
     * @param {语法树} ast 
     */
    ConditionalExpression(ast, parentNode) {
        this.selectRun(ast.test, ast);
        this.code.addExceptEnter(' ').
            addBehindSpace(operator.conditionalOperator.questionMark);
        this.selectRun(ast.consequent, ast);
        this.code.addExceptEnter(' ').
            addBehindSpace(operator.conditionalOperator.colon);
        this.selectRun(ast.alternate, ast);
    }
    // 展开
    RestElement(ast, parentNode) {
        this.code.add(type.spread);
        this.selectRun(ast.argument, ast);
    }
    // 箭头函数
    ArrowFunctionExpression(ast, parentNode) {
        if (ast.async) {
            this.code.addBehindSpace(jsKey.async);
        }
        this.code.add(brackets.parentheses.leftParentheses);
        this.selectForRun(ast.params, ast, (index) => {
            this.code.addCommaExceptEndNode(index, ast.params.length);
        });
        this.code.addExceptEnter(brackets.parentheses.rightParentheses).addSpace().
            addBehindSpace(typeCode.arrowFunction);
        this.selectRun(ast.body, ast);
    }
    /**
     * 对象表达式
     * @param {语法树} ast 
     */
    ObjectExpression(ast, parentNode) {
        if (ast.properties.length <= 0) {
            this.code.addBehindSpace(brackets.braces.leftBraces).
                addBehindEnter(brackets.braces.rightBraces);
        } else {

            this.code.addBehindEnter(brackets.braces.leftBraces);
            this.code.addSpaceNum();
            this.selectForRun(ast.properties, ast, (index) => {
                this.code.addCommaExceptEndNode(index, ast.properties.length);
            });
            this.code.reduceSpaceNum();
            this.code.spaceAlignment();
            this.code.addBehindEnter(brackets.braces.rightBraces);
        }
    }
    // 对象模式
    ObjectPattern(ast, parentNode) {

        this.code.addBehindSpace(brackets.braces.leftBraces);
        this.selectForRun(ast.properties, ast, (index) => {
            this.code.addCommaExceptEndNode(index, ast.properties.length);
        });
        this.code.add(brackets.braces.rightBraces);
    }
    // 对象里面的属性
    Property(ast, parentNode) {
        this.code.spaceAlignment();
        this.selectRun(ast.key, ast);
        if (!ast.shorthand && !ast.method) {
            this.code.addBehindSpace(operator.conditionalOperator.colon);
            this.selectRun(ast.value, ast);
        }
        if (ast.method) {
            this.selectRun(ast.value, ast);
        }
    }
    /**
     * 数组出咯
     * @param {语法树} ast 
     */
    ArrayExpression(ast, parentNode) {
        this.Array(ast, parentNode);
    }

    /**
     * 如果父节点是 BlockStatement 打印空格
     * @param {父节点} parentNode 
     */
    blockSpaceAlignment(parentNode) {
        if (type.isType(parentNode.type, astConfig.BlockStatement)) {
            this.code.spaceAlignment();
        }
    }

    Array(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.add(brackets.middlebrackets.leftMiddlebrackets);
        this.selectForRun(ast.elements, ast, (index) => {
            this.code.addCommaExceptEndNode(index, ast.elements.length);
        });
        this.code.add(brackets.middlebrackets.rightMiddlebrackets);
        if (type.isType(parentNode.type, astConfig.BlockStatement)) {
            this.code.addSemicolon();
        }
    }
    /**
     * 数组模式
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    ArrayPattern(ast, parentNode) {
        this.Array(ast, parentNode);
    }
    // 调用函数
    CallExpression(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.selectRun(ast.callee, ast);
        this.code.add(brackets.parentheses.leftParentheses);
        this.selectForRun(ast.arguments, ast, (index) => {
            this.code.addCommaExceptEndNode(index, ast.arguments.length);
        })
        this.code.addExceptEnter(brackets.parentheses.rightParentheses);
    }
    /**
     * 成员表达式
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    MemberExpression(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.selectRun(ast.object, ast);
        if (ast.computed) {
            this.code.add(brackets.middlebrackets.leftMiddlebrackets);
        } else {
            this.code.add(operator.memberOperator.spot);
        }
        this.selectRun(ast.property, ast);
        if (ast.computed)
            this.code.add(brackets.middlebrackets.rightMiddlebrackets);
    }
    // 分配模式 也就是给默认值
    AssignmentPattern(ast, parentNode) {
        this.selectRun(ast.left, ast);
        this.code.addFrontBehindSpace(operator.assignmentOperator.equal);
        this.selectRun(ast.right, ast);
    }
    /**
     * this 表达式
     */
    ThisExpression(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.add(jsKey.this);
    }
    /**
     * 一元表达式
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    UnaryExpression(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.addBehindSpace(ast.operator);
        this.selectRun(ast.argument, ast);
    }
    /**
     * 更新表达式
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    UpdateExpression(ast, parentNode) {
        if (ast.prefix) {
            this.code.addBehindSpace(ast.operator);
        }
        this.selectRun(ast.argument, ast);
        if (!ast.prefix) {
            this.code.addBehindSpace(ast.operator);
        }
    }
    /**
     * 序列表达式
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    SequenceExpression(ast, parentNode) {
        this.code.add(brackets.parentheses.leftParentheses);
        this.selectForRun(ast.expressions, ast, (index) => {
            this.code.addCommaExceptEndNode(index, ast.expressions.length);
        });
        this.code.addExceptEnter(brackets.parentheses.rightParentheses);
    }
    /**
     * 返回语句
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    ReturnStatement(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.addBehindSpace(jsKey.return);
        this.selectRun(ast.argument, ast);
        this.code.addSemicolon();
    }
    /**
     * 标记
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    LabeledStatement(ast, parentNode) {
        this.selectRun(ast.label, ast);
        this.code.addBehindSpace(operator.conditionalOperator.colon);
        this.selectRun(ast.body, ast);
    }
    /**
     * 展开元素
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    SpreadElement(ast, parentNode) {
        ast.code.add(typeCode.spread);
        this.selectRun(ast.argument, ast);
    }

    /**
     * 逻辑表达式
     * @param {语法树} ast
     * @param {父节点} parentNode
     */
    LogicalExpression(ast, parentNode) {
        this.selectRun(ast.left, ast);
        this.code.addFrontBehindSpace(ast.operator);
        this.selectRun(ast.right, ast);
    }
    /**
     * if 语句
     * @param {语法树} ast
     * @param {父节点} parentNode
     */
    IfStatement(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.addBehindSpace(jsKey.if);
        this.code.add(brackets.parentheses.leftParentheses);
        this.selectRun(ast.test, ast);
        this.code.addExceptEnter(brackets.parentheses.rightParentheses).addSpace();
        this.selectRun(ast.consequent, ast);
        this.code.addExceptEnter(typeCode.lineFeed);
        if (ast.alternate) {
            this.code.addExceptEnter(' ').addBehindSpace(jsKey.else);
            this.selectRun(ast.alternate, ast);
        }
    }
    /**
     * new 表达式
     * @param {语法树} ast
     * @param {父节点} parentNode
     */
    NewExpression(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.addBehindSpace(jsKey.new);
        this.selectRun(ast.callee, ast);
        this.code.add(brackets.parentheses.leftParentheses);
        this.selectForRun(ast.arguments, ast, (index) => {
            this.code.addCommaExceptEndNode(index, ast.arguments.length);
        });
        this.code.addExceptEnter(brackets.parentheses.rightParentheses);
    }
    /**
     * while 语句
     * @param {语法树} ast
     * @param {父节点} parentNode
     */
    WhileStatement(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.addBehindSpace(jsKey.while);
        this.code.add(brackets.parentheses.leftParentheses);
        this.selectRun(ast.test, ast);
        this.code.addExceptEnter(brackets.parentheses.rightParentheses).addSpace();
        this.selectRun(ast.body, ast);
        this.code.addExceptEnter(typeCode.lineFeed);
    }
    /**
     * 空语句
     */
    EmptyStatement() {
        this.code.addSemicolon();
    }
    /**
     * do while 语句
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    DoWhileStatement(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.addBehindSpace(jsKey.do);
        this.selectRun(ast.body, ast);
        this.code.addExceptEnter(' ').addBehindSpace(jsKey.while);
        this.code.add(brackets.parentheses.leftParentheses);
        this.selectRun(ast.test, ast);
        this.code.addExceptEnter(brackets.parentheses.rightParentheses);
        this.code.addSemicolon();
    }
    /**
     * break 语句
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    BreakStatement(ast, parentNode) {
        BreakAndContinue(ast, parentNode);
    }
    BreakAndContinue(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.add(jsKey.break);
        if (ast.label) {
            this.code.addSpace();
            this.selectRun(ast.label, ast);
        }
        this.code.addSemicolon();
    }
    /**
     * continue 语句
     * @param {语法树} ast
     * @param {父节点} parentNode
     */
    ContinueStatement(ast, parentNode) {
        BreakAndContinue(ast, parentNode);
    }
    /**
     * for 语句
     * @param {语法树} ast
     * @param {父节点} parentNode
     */
    ForStatement(ast, parentNode) {
        this.For(ast, parentNode);
    }
    /**
     * for in 语句
     * @param {语法树} ast
     * @param {父节点} parentNode
     */
    ForInStatement(ast, parentNode) {
        this.For(ast, parentNode);
    }

    For(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.addBehindSpace(jsKey.for);
        this.code.add(brackets.parentheses.leftParentheses);
        if (type.isType(ast.type, astConfig.ForStatement)) {
            this.selectRun(ast.init, ast);
            this.code.addExceptEnter(typeCode.semicolon).addSpace();
            this.selectRun(ast.test, ast);
            this.code.addExceptEnter(typeCode.semicolon).addSpace();
            this.selectRun(ast.update, ast);
        } else {
            this.selectRun(ast.left, ast);
            if (type.isType(ast.type, astConfig.ForInStatement)) {
                this.code.addFrontBehindSpace(jsKey.in);
            } else {
                this.code.addFrontBehindSpace(jsKey.of);
            }
            this.selectRun(ast.right, ast);
        }
        this.code.addExceptEnter(brackets.parentheses.rightParentheses).addSpace();
        this.selectRun(ast.body, ast);
    }
    /**
     * for of 语句
     * @param {语法树} ast
     * @param {父节点} parentNode
     */
    ForOfStatement(ast, parentNode) {
        this.For(ast, parentNode);
    }
    /**
     * switch 语句
     * @param {语法树} ast
     * @param {父节点} parentNode
     */
    SwitchStatement(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.addBehindSpace(jsKey.switch);
        this.code.add(brackets.parentheses.leftParentheses);
        this.selectRun(ast.discriminant, ast);
        this.code.addExceptEnter(brackets.parentheses.rightParentheses).addSpace();
        if (ast.cases.length === 0) {
            this.code.addBehindSpace(brackets.braces.leftBraces);
            this.code.addBehindEnter(brackets.braces.rightBraces);
        } else {
            this.code.addBehindEnter(brackets.braces.leftBraces);
            this.code.addSpaceNum();
            selectForRun(ast.cases, ast);
            this.code.reduceSpaceNum();
            this.blockSpaceAlignment(parentNode);
            this.code.addBehindEnter(brackets.braces.rightBraces);
        }
    }
    /**
     * switch 中的 case
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    SwitchCase(ast, parentNode) {
        this.code.spaceAlignment();
        if (ast.test) {
            this.code.addBehindSpace(jsKey.case);
            this.selectRun(ast.test, ast);
        } else {
            this.code.addBehindSpace(jsKey.default);
        }
        this.code.addBehindEnter(operator.conditionalOperator.colon);
        this.code.addSpaceNum();
        this.selectForRun(ast.consequent, ast);
        this.code.reduceSpaceNum();
    }
    /**
     * yield 表达式
     * @param {语法树} ast
     * @param {父节点} parentNode
     */
    YieldExpression(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        if (ast.delegate) {
            this.code.addBehindSpace(jsKey["yield*"]);
        } else {
            this.code.addBehindSpace(jsKey.yield);
        }
        this.selectRun(ast.argument, ast);
        this.code.addSemicolon();
    }

    /**
     * with 语句
     */
    WithStatement(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.addBehindSpace(jsKey.with);
        this.code.add(brackets.parentheses.leftParentheses);
        this.selectRun(ast.object, ast);
        this.code.addExceptEnter(brackets.parentheses.rightParentheses).addSpace();
        this.selectRun(ast.body, ast);
    }
    /**
     * await 表达式
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    AwaitExpression(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.addBehindSpace(jsKey.await);
        this.selectRun(ast.argument, ast);
        if (type.isType(parentNode.type, astConfig.BlockStatement)) {
            this.code.addSemicolon();
        }
    }

    /**
     * debugger 语句
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    DebuggerStatement(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.add(jsKey.debugger).addSemicolon();
    }
    /**
     *  throw 语句
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    ThrowStatement(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.addBehindSpace(jsKey.throw);
        this.selectRun(ast.argument, ast);
        this.code.addSemicolon();
    }
    /**
     * try 语句
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    TryStatement(ast, parentNode) {
        this.blockSpaceAlignment(parentNode);
        this.code.addBehindSpace(jsKey.try);
        this.selectRun(ast.block, ast);
        this.selectRun(ast.handler, ast);
        if (ast.finalizer) {
            this.code.addExceptEnter(jsKey.finally).addSpace();
            this.selectRun(ast.finalizer, ast);
        }
    }
    /**
     * catch 子句
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    CatchClause(ast, parentNode) {
        this.code.addExceptEnter(jsKey.catch).addSpace();
        this.code.add(brackets.parentheses.leftParentheses);
        this.selectRun(ast.param, ast);
        this.code.addExceptEnter(brackets.parentheses.rightParentheses).addSpace();
        this.selectRun(ast.body, ast);
    }
    /**
     * class 表达式
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    ClassExpression(ast, parentNode) {
        this.Class(ast, parentNode);
    }
    Class(ast, parentNode) {

        this.blockSpaceAlignment(parentNode);
        this.code.addBehindSpace(jsKey.class);
        this.selectRun(ast.id, ast);
        if (ast.superClass) {
            if (ast.id) {
                this.code.addSpace();
            }
            this.code.addBehindSpace(jsKey.extends);
            this.selectRun(ast.superClass, ast);
        }
        if (ast.id) {
            this.code.addSpace();
        }
        this.selectRun(ast.body, ast);
    }
    /**
     * class 声明
     * @param {语法树} ast
     * @param {父节点} parentNode
     */
    ClassDeclaration(ast, parentNode) {
        this.Class(ast, parentNode);
    }
    /**
     * class 身体
     * @param {语法树} ast
     * @param {父节点} parentNode
     */
    ClassBody(ast, parentNode) {
        if (ast.body.length === 0) {
            this.code.addBehindSpace(brackets.braces.leftBraces);
            this.code.addBehindEnter(brackets.braces.rightBraces);
        } else {
            this.code.addBehindEnter(brackets.braces.leftBraces);
            this.code.addSpaceNum();
            this.selectForRun(ast.body, ast);
            this.code.reduceSpaceNum();
            this.code.spaceAlignment();
            this.code.addBehindEnter(brackets.braces.rightBraces);
        }
    }
    /**
     * 方法定义
     * @param {语法树} ast
     * @param {父节点} parentNode
     */
    MethodDefinition(ast, parentNode) {
        this.code.spaceAlignment();
        if (ast.static) {
            this.code.addBehindSpace(jsKey.static);
        }
        this.selectRun(ast.key, ast);
        this.selectRun(ast.value, ast);
    }
    /**
     * 超类
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    Super(ast, parentNode) {
        this.code.spaceAlignment();
        this.code.add(jsKey.super);
    }
    /**
     * export 名称声明
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    ExportNamedDeclaration(ast, parentNode) {
        this.code.spaceAlignment();
        this.code.addBehindSpace(jsKey.export);
        if (ast.declaration) {
            this.selectRun(ast.declaration, ast);
        }
        if (ast.specifiers.length > 0) {
            this.code.addBehindSpace(brackets.braces.leftBraces);
            this.selectForRun(ast.specifiers, ast, (index) => {
                this.code.addCommaExceptEndNode(index, ast.specifiers.length);
            });
            this.code.addFrontSpace(brackets.braces.rightBraces);
        }
        if (ast.source) {
            this.code.addFrontBehindSpace(jsKey.from);
            this.selectRun(ast.source, ast);
        }
        this.code.addSemicolon();
    }
    /**
     * export 说明
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    ExportSpecifier(ast, parentNode) {
        this.selectRun(ast.local, ast);
        if (ast.local.name !== ast.exported.name) {
            this.code.addFrontBehindSpace(jsKey.as);
            this.selectRun(ast.exported, ast);
        }
    }
    /**
     * 默认 export
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    ExportDefaultDeclaration(ast, parentNode) {
        this.code.spaceAlignment();
        this.code.addBehindSpace(jsKey.export);
        this.code.addBehindSpace(jsKey.default);
        this.selectRun(ast.declaration, ast);
        this.code.addSemicolon();
    }
    /**
     * export 所有
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    ExportAllDeclaration(ast, parentNode) {
        this.code.spaceAlignment();
        this.code.addBehindSpace(jsKey.export);
        this.code.addBehindSpace(operator.binaryOperator.ride);
        if (ast.exported) {
            this.code.addBehindSpace(jsKey.as);
            this.selectRun(ast.exported, ast);
            this.code.addSpace();
        }
        this.code.addBehindSpace(jsKey.from);
        this.selectRun(ast.source, ast);
        this.code.addSemicolon();
    }
    /**
     * import 声明
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    ImportDeclaration(ast, parentNode) {
        this.code.spaceAlignment();
        this.code.addBehindSpace(jsKey.import);
        if (ast.specifiers.length > 0) {
            if (type.isType(ast.specifiers[0].type, astConfig.ImportDefaultSpecifier)) {
                const tree = ast.specifiers.shift();
                this.select.run(astConfig.ImportDefaultSpecifier, [tree]);
                if (ast.specifiers.length > 0) {
                    this.code.addBehindSpace(operator.sequenceOperator.comma);
                } else {
                    this.code.addSpace();
                }
            }
            if (type.isType(ast.specifiers[0].type, astConfig.ImportNamespaceSpecifier)) {
                const tree = ast.specifiers.shift();
                this.select.run(astConfig.ImportNamespaceSpecifier, [tree]);
                if (ast.specifiers.length > 0) {
                    this.code.addBehindSpace(operator.sequenceOperator.comma);
                } else {
                    this.code.addSpace();
                }
            }
            if (ast.specifiers.length > 0) {
                this.code.addBehindSpace(brackets.braces.leftBraces);
                this.selectForRun(ast.specifiers, ast, (index) => {
                    this.code.addCommaExceptEndNode(index, ast.specifiers.length);
                });
                this.code.addFrontBehindSpace(brackets.braces.rightBraces);
            }
        }
        this.code.addBehindSpace(jsKey.from);
        this.selectRun(ast.source, ast);
        this.code.addSemicolon();
    }
    /**
     * import 默认说明
     * @param {语法树} ast 
     */
    ImportDefaultSpecifier(ast) {
        this.selectRun(ast.local, ast);
    }
    /**
     * import 声明
     * @param {语法树} ast 
     * @param {父节点} parentNode 
     */
    ImportSpecifier(ast, parentNode) {
        this.selectRun(ast.imported, ast);
        if (ast.imported.name !== ast.local.name) {
            this.code.addFrontBehindSpace(jsKey.as);
            this.selectRun(ast.local, ast);
        }
    }
    /**
     * import 命名空间说明符
     * @param {语法树} ast 
     */
    ImportNamespaceSpecifier(ast) {
        this.code.addBehindSpace(operator.binaryOperator.ride);
        this.code.addBehindSpace(jsKey.as);
        this.selectRun(ast.local, ast);
    }
}