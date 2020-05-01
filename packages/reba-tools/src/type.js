const selector = require("./selector");

module.exports = {
    /**
     * 判断 type1 是否等于 type2
     * @param {类型一} type1 
     * @param {类型二 可以是数组} type2 
     */
    isType(type1,type2){
        if(type2 instanceof Array) {
            for (let index = 0; index < type2.length; index++) {
                if(type1 === type2[index]) {
                    return true;
                }                
            }
            return false;
        }
        return type1 === type2;
    },
    /**
     * 判断type是否是parent的子类
     * @param {类型} type 
     * @param {父类} parent 
     */
    isParent (type, parent){
        return parent[type] ? true: false;
    },
    /**
     * 判断type是否是super的子孙类
     * @param {类型} type
     * @param {超类} ancestor
     */
    isAncestor(type, ancestor) {
        let is = this.isParent(type, ancestor);
        if(!is) {
            for (const key in ancestor) {
                if (ancestor.hasOwnProperty(key)) {
                    const element = ancestor[key];
                    is = this.isParent(type, element);
                    if(is) break;
                }
            }
        }
        return is;
    },
    /**
     * 二元运算符
     * @param {类型} type 
     */
    isBinaryOperator(type) {        
        return this.isParent(type,this.operator.binaryOperator);
    },
    /**
     * 更新运算符
     * @param {类型} type 
     */
    isUpdateOperator (type) {
        return this.isParent(type, this.operator.updateOperator);
    },
    /**
     * 赋值运算符
     * @param {类型} type 
     */
    isAssignmentOperator (type) {
        return this.isParent(type, this.operator.assignmentOperator);
    },
    /**
     * 条件运算符
     * @param {类型} type 
     */
    isConditionalOperator (type) {
        return this.isParent(type, this.operator.conditionalOperator);
    },
    /**
     * 成员运算符
     * @param {类型} type 
     */
    isMemberOperator (type) {
        return this.isParent(type, this.operator.memberOperator);
    },
    /**
     * 序列运算符
     * @param {类型} type
     */
    isSequenceOperator (type) {
        return this.isParent(type, this.operator.sequenceOperator);
    },
    /**
     * 逻辑运算符
     * @param {类型} type 
     */
    isLogicalOperator(type) {
        return this.isParent(type, this.operator.logicalOperator);
    },
    /**
     * 单目运算符
     * @param {类型} type 
     */
    isUnaryOperator (type) {
        return this.isParent(type, this.operator.unaryOperator);
    },
    /**
     * 是等于符号
     * @param {类型} type 
     */
    isEqual(type){
        return type === this.operator.assignmentOperator.equal;
    },
    /**
     * 返回所有运算符
     */
    getAllOperator () {
        const operator = {};
        for (const operatorParent  in this.operator) {
            Object.assign(operator, this.operator[operatorParent]);
        }
        return operator;
    },
    /**
     * 返回类型的权限
     * @param {类型} type 
     */
    getPriority(type){
        const select = new selector(this);
        return select.push([
            this.brackets.parentheses.leftParentheses,
            this.brackets.parentheses.rightParentheses,
        ],() =>  18).push([
            this.operator.memberOperator.spot,
            this.brackets.middlebrackets.leftMiddlebrackets,
            this.brackets.middlebrackets.rightMiddlebrackets,
            this.operator.memberOperator.optionalChaining,
            this.jsKey.new
        ],() => 17).push([
            this.operator.updateOperator.addOne,
            this.operator.updateOperator.reduceOne,
            this.jsKey.delete,
            this.jsKey.await,
            this.jsKey.new,
            this.jsKey.typeof,
            this.jsKey.void,
            this.operator.unaryOperator.logicInverse,
            this.operator.unaryOperator.inverse
        ],() => 16).push([
            this.operator.binaryOperator.involution
        ]).push([
            this.operator.binaryOperator.ride,
            this.operator.binaryOperator.except,
            this.operator.binaryOperator.remainder
        ],()=> 15).push([
            this.operator.binaryOperator.add,
            this.operator.binaryOperator.reduce
        ], () => 14).push([
            this.operator.binaryOperator.leftShift,
            this.operator.binaryOperator.rightShift,
            this.operator.binaryOperator.signedRightShift
        ], () => 13).push([
            this.jsKey.instanceof,
            this.jsKey.in,
            this.operator.binaryOperator.less,
            this.operator.binaryOperator.lessEqual,
            this.operator.binaryOperator.greater,
            this.operator.binaryOperator.greaterEqual,
        ], () => 12).push([
            this.operator.binaryOperator.equalEqual,
            this.operator.binaryOperator.identity,
            this.operator.binaryOperator.notEqual,
            this.operator.binaryOperator.notIdentity
        ], () => 11).push([
            this.operator.binaryOperator.and
        ], () => 10).push([
            this.operator.binaryOperator.xor
        ], () => 9).push([
            this.operator.binaryOperator.or
        ], () => 8).push([
            this.operator.logicalOperator.logicAnd
        ], () => 7).push([
            this.operator.logicalOperator.logicOr
        ], () => 6).push([
            this.operator.conditionalOperator.questionMark,
            this.operator.conditionalOperator.colon
        ], () => 5).push([
            this.operator.assignmentOperator.equal,
            this.operator.assignmentOperator.addEqual,
            this.operator.assignmentOperator.reduceEqual,
            this.operator.assignmentOperator.exceptEqual,
            this.operator.assignmentOperator.rideEqual,
            this.operator.assignmentOperator.remainderEqual,
            this.operator.assignmentOperator.rightShiftEqual,
            this.operator.assignmentOperator.signedRightShiftEqual,
            this.operator.assignmentOperator.leftShiftEqual,
            this.operator.assignmentOperator.andEqual,
            this.operator.assignmentOperator.orEqual,
            this.operator.assignmentOperator.xorEqual
        ], () => 4).push([
            this.jsKey.yield,
            this.jsKey["yield*"]
        ], () => 3).push([
            this.spread
        ], () => 2).push([
            this.operator.sequenceOperator.comma
        ], () => 1).run(type);
    },
    lineFeed:"lineFeed",
    // 数字类型
    number:"number",
    // 字符串
    characterString: "characterString",
    // 变量名字
    variableName: "variableName",
    // 单行注解
    singleLineComment: "singleLineComments",
    // 多行注解
    multilineComment: "multilineComment",
    // 正则表达式
    regular:"regular",
    // 运算符
    operator: {

        binaryOperator: {
            // +
            add: "add",
            // -
            reduce: "reduce",
            // *
            ride: "ride",
            // **
            involution: "involution",
            // /
            except: "except",
            // %
            remainder: "remainder",
            // ==
            equalEqual: "equalEqual",
            // ===
            identity: "identity",
            // !=
            notEqual: "notEqual",
            // !==
            notIdentity: "notIdentity",
            // >
            greater: "greater",
            // >=
            greaterEqual: "greaterEqual",
            // <
            less: "less",
            // <=
            lessEqual: "lessEqual",
            // &
            and: "and",
            // |
            or: "or",
            // ^
            xor: "xor",
            // <<
            leftShift: "leftShift",
            // >>>
            rightShift: "rightShift",
            // >>
            signedRightShift: "signedRightShift",
        },
        updateOperator: {
            // ++
            addOne: "addOne",
            // --
            reduceOne: "reduceOne",
        },
        assignmentOperator:{
            // =
            equal: "equal",
            // +=
            addEqual: "addEqual",
            // -=
            reduceEqual: "reduceEqual",
            // /=
            exceptEqual: "exceptEqual",
            // *=
            rideEqual: "rideEqual",
            // %=
            remainderEqual: "remainderEqual",
            // >>>=
            rightShiftEqual: "rightShiftEqual",
            // >>=
            signedRightShiftEqual: "signedRightShiftEqual",
            // <<=
            leftShiftEqual: "leftShiftEqual",
            // &=
            andEqual:"andEqual",
            // |=
            orEqual:"orEqual",
            // ^=
            xorEqual:"xorEqual"
        },
        conditionalOperator:{
            // ? 
            questionMark: "questionMark",
            // :
            colon:"colon"
        },
        memberOperator:{
            // .
            spot: "spot",
            // ?.
            optionalChaining:"optionalChaining"
        },
        unaryOperator:{
            // !
            logicInverse: "logicInverse",
            // ~
            inverse: "inverse"
        },
        logicalOperator:{
            // &&
            logicAnd: "logicAnd",
            // ||
            logicOr: "logicOr"
            
        },
        sequenceOperator:{
            // ,
            comma: "comma"
        },
    },
    // ...
    spread: "spread",
    // ;
    semicolon: "semicolon",
    // =>
    arrowFunction: "arrowFunction",
    // 括号
    brackets: {
        braces: {
            // {
            leftBraces: "leftBraces",
            // }
            rightBraces: "rightBraces"
        },
        middlebrackets: {
            // [
            leftMiddlebrackets: "leftMiddlebrackets",
            // ]
            rightMiddlebrackets: "rightMiddlebrackets"
        },
        parentheses: {
            // (
            leftParentheses: "leftParentheses",
            // )
            rightParentheses: "rightParentheses"
        }
    },
    jsKey: {
        abstract: "abstract",
        arguments: "arguments",
        boolean: "boolean",
        break: "break",
        byte: "byte",
        case: "case",
        catch: "catch",
        char: "char",
        class: "class",
        const: "const",
        continue: "continue",
        debugger: "debugger",
        default: "default",
        delete: "delete",
        do: "do",
        double: "double",
        else: "else",
        enum: "enum",
        eval: "eval",
        export: "export",
        extends: "extends",
        false: "false",
        final: "final",
        finally: "finally",
        float: "float",
        for: "for",
        function: "function",
        "function*": "function*",
        goto: "goto",
        if: "if",
        implements: "implements",
        import: "import",
        in: "in",
        instanceof: "instanceof",
        int: "int",
        interface: "interface",
        let: "let",
        long: "long",
        native: "native",
        new: "new",
        null: "null",
        package: "package",
        private: "private",
        protected: "protected",
        public: "public",
        return: "return",
        short: "short",
        static: "static",
        super: "super",
        switch: "switch",
        synchronized: "synchronized",
        this: "this",
        throw: "throw",
        throws: "throws",
        transient: "transient",
        true: "true",
        try: "try",
        typeof: "typeof",
        var: "var",
        void: "void",
        volatile: "volatile",
        while: "while",
        with: "with",
        yield: "yield",
        "yield*": "yield*",
        await:"await"
    }
}