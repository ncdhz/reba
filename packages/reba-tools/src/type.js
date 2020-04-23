module.exports = {
    /**
     * 判断 type1 是否等于 type2
     * @param {类型一} type1 
     * @param {类型二} type2 
     */
    isType(type1,type2){
        return type1 === type2;
    },
    /**
     * 判断type是否是parent的子类
     * @param {类型} type 
     * @param {父类} parent 
     */
    isParent (type,parent){
        return parent[type] ? true: false;
    },
    /**
     * 判断type是否是super的子孙类
     * @param {类型} type
     * @param {超类} ancestor
     */
    isAncestor(type, ancestor) {
        let is = this.isParent(type, ancestor);
        if(! is) {
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
    isLogicalOperator: function (type) {
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
        },
        conditionalOperator:{
            // ? 或 :
            ternaryOperator: "ternaryOperator",
        },
        memberOperator:{
            // .
            spot: "spot",
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
        yield: "yield"
    }
}