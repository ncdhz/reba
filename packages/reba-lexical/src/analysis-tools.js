const rebaTools = require("reba-tools");
const os = require("os");
const type = rebaTools.type;
// 用于操作符号类型
const operator = type.getAllOperator();
// 用于括号类型
const brackets = type.brackets;
// 用于记录关键字
const jsKey = type.jsKey;


module.exports = class {

    constructor(codeInformation) {
        this.codeInformation = codeInformation;
    }
    /**
     * 用于处理空字符
     */
    empty() {
        if (os.EOL === this.codeInformation.getNowChar()){
            this.codeInformation.setToken(this.codeInformation.codeStartLength,
                this.codeInformation.codeStartLength, type.lineFeed, os.EOL);
            this.codeInformation.rowAddOne();
        }
        this.codeInformation.getTokenLengthAddOne();
    }
    /**
     * 用于分析以数字开头的字符
     */
    number() {
        const codeInformation = this.codeInformation;
        /**
         * 用于分析十进制数
         */
        function number10() {
            while (/[0-9\.eE]/.test(codeInformation.getNowChar()) &&
                codeInformation.getNowChar()) {
                if (/[eE]/.test(codeInformation.getNowChar())) {
                    numberOne += codeInformation.getTokenLengthAddOne();
                }
                numberOne += codeInformation.getTokenLengthAddOne();
            }
        }
        function number8And16() {
            while (/[a-fA-F0-9Xx]/.test(codeInformation.getNowChar()) &&
                codeInformation.getNowChar()) {
                numberOne += codeInformation.getTokenLengthAddOne();
            }
        }
        const start = codeInformation.codeStartLength;
        let numberOne = codeInformation.getTokenLengthAddOne();
        switch (numberOne) {
            case '0':
                switch (codeInformation.getNowChar()) {
                    case '.':
                        number10();
                        break;
                    default:
                        number8And16();
                }
                break;
            default:
                number10();
        }
        codeInformation.setToken(start, codeInformation.codeStartLength - 1, type.number, numberOne);
    }
    /**
     * 当词法分析器检测到是用$或_时使用的分析器
     */
    variable() {
        const start = this.codeInformation.codeStartLength;
        let variableName = this.codeInformation.getTokenLengthAddOne();
        while (this.codeInformation.getNowChar() &&
            /[a-zA-Z\$0-9\_]/.test(this.codeInformation.getNowChar())) {
            variableName += this.codeInformation.getTokenLengthAddOne();
        }
        this.codeInformation.setToken(start, this.codeInformation.codeStartLength - 1, type.variableName, variableName);    
    }
    /**
     * JavaScript 中模板处理
     */
    template(){
        const start = this.codeInformation.codeStartLength;
        let templateOne = this.codeInformation.getTokenLengthAddOne();
        while (this.codeInformation.getNowChar() && 
            this.codeInformation.getNowChar() !== "`") {
            if (this.codeInformation.getNowChar() === "\\") {
                templateOne += this.codeInformation.getTokenLengthAddOne();
            }
            templateOne += this.codeInformation.getTokenLengthAddOne();
        }
        templateOne += this.codeInformation.getTokenLengthAddOne();
        this.codeInformation.setToken(start, this.codeInformation.codeStartLength - 1, type.template, templateOne);
    }   
    /**
     * 用与处理所有的符号
     */
    symbol() {
        const start = this.codeInformation.codeStartLength;
        let symbolOne = this.codeInformation.getTokenLengthAddOne();
        let symbolType;


        switch (symbolOne) {
            case "+":
                symbolType = operator.add;
                switch (this.codeInformation.getNowChar()) {
                    case "+":
                        symbolType = operator.addOne;
                        break;
                    case "=":
                        symbolType = operator.addEqual;
                        break;
                }
                if (symbolType !== operator.add)
                    symbolOne += this.codeInformation.getTokenLengthAddOne();
                break;
            case "-":
                symbolType = operator.reduce;
                switch (this.codeInformation.getNowChar()) {
                    case "-":
                        symbolType = operator.reduceOne;
                        break;
                    case "=":
                        symbolType = operator.reduceEqual;
                        break;
                }
                if (symbolType !== operator.reduce)
                    symbolOne += this.codeInformation.getTokenLengthAddOne();
                break;
            case "*":
                symbolType = operator.ride;
                switch (this.codeInformation.getNowChar()) {
                    case "=":
                        symbolType = operator.rideEqual;
                        break;
                    case "*":
                        symbolType = operator.involution;
                        break;
                }
                if (symbolType !== operator.ride)
                    symbolOne += this.codeInformation.getTokenLengthAddOne();
                break;
            case "/":
                symbolType = operator.except;
                switch (this.codeInformation.getNowChar()) {
                    case "=":
                        symbolType = operator.exceptEqual;
                        symbolOne += this.codeInformation.getTokenLengthAddOne();
                        break;
                }
                break;
            case "%":
                symbolType = operator.remainder;
                switch (this.codeInformation.getNowChar()) {
                    case "=":
                        symbolType = operator.remainderEqual;
                        symbolOne += this.codeInformation.getTokenLengthAddOne();
                        break;
                }
                break;
            case "=":
                symbolType = operator.equal;
                switch (this.codeInformation.getNowChar()) {
                    case "=":
                        symbolOne += this.codeInformation.getTokenLengthAddOne();
                        symbolType = operator.equalEqual;
                        if (this.codeInformation.getNowChar() === "=") {
                            symbolType = operator.identity;
                            symbolOne += this.codeInformation.getTokenLengthAddOne();
                        }
                        break;
                    case ">":
                        symbolOne += this.codeInformation.getTokenLengthAddOne();
                        symbolType = type.arrowFunction;
                        break;
                }
                break;
            case "!":
                symbolType = operator.logicInverse;
                switch (this.codeInformation.getNowChar()) {
                    case "=":
                        symbolOne += this.codeInformation.getTokenLengthAddOne();
                        symbolType = operator.notEqual;
                        if (this.codeInformation.code[
                            this.codeInformation.codeStartLength
                        ] === "=") {
                            symbolType = operator.notIdentity;
                            symbolOne += this.codeInformation.getTokenLengthAddOne();
                        }
                        break;
                }
                break;
            case "<":
                symbolType = operator.less;
                switch (this.codeInformation.getNowChar()) {
                    case "=":
                        symbolOne += this.codeInformation.getTokenLengthAddOne();
                        symbolType = operator.lessEqual;
                        break;
                    case "<":
                        symbolType = operator.leftShift;
                        symbolOne += this.codeInformation.getTokenLengthAddOne();
                        if (this.codeInformation.getNowChar() === "=") {
                            symbolType = operator.leftShiftEqual;
                            symbolOne += this.codeInformation.getTokenLengthAddOne();
                        }
                        break;
                }
                break;
            case ">":
                symbolType = operator.greater;
                switch (this.codeInformation.getNowChar()) {
                    case "=":
                        symbolType = operator.greaterEqual;
                        symbolOne += this.codeInformation.getTokenLengthAddOne();
                        break;
                    case ">":
                        symbolType = operator.signedRightShift;
                        symbolOne += this.codeInformation.getTokenLengthAddOne();
                        if (this.codeInformation.getNowChar() === ">") {
                            symbolType = operator.rightShift;
                            symbolOne += this.codeInformation.getTokenLengthAddOne();
                            if (this.codeInformation.getNowChar() === "=") {
                                symbolType = operator.rightShiftEqual;
                                symbolOne += this.codeInformation.getTokenLengthAddOne();
                            }
                        }
                        if (this.codeInformation.getNowChar() === "=") {
                            symbolType = operator.signedRightShiftEqual;
                            symbolOne += this.codeInformation.getTokenLengthAddOne();
                        }
                        break;
                }

                break;
            case "?":
                symbolType = operator.questionMark;
                if(this.codeInformation.getNowChar() === ".") {
                    symbolType = operator.optionalChaining;
                    symbolOne += this.codeInformation.getTokenLengthAddOne();
                }
                break;
            case ":":
                symbolType = operator.colon;
                break;
            case ".":
                symbolType = operator.spot;
                // 用于判断展开运算符
                if (type.isType(this.codeInformation.getNowChar(), '.')) {
                    if (type.isType(this.codeInformation.code[this.codeInformation.codeStartLength + 1],'.')) {
                        symbolOne += this.codeInformation.getTokenLengthAddOne()
                         + this.codeInformation.getTokenLengthAddOne();
                         symbolType = type.spread;
                    }
                }
                break;
            case "&":
                symbolType = operator.add;
                switch (this.codeInformation.getNowChar()) {
                    case "&":
                        symbolType = operator.logicAnd;
                        break;
                    case "=":
                        symbolType = operator.andEqual;
                        break;
                }
                if (symbolType !== operator.add)
                    symbolOne += this.codeInformation.getTokenLengthAddOne();
                break;
            case "|":
                symbolType = operator.or;
                switch (this.codeInformation.getNowChar()) {
                    case "|":
                        symbolType = operator.logicOr;
                        break;
                    case "=":
                        symbolType = operator.orEqual;
                        break;
                }
                if (symbolType !== operator.or)
                    symbolOne += this.codeInformation.getTokenLengthAddOne();
                break;
            case "~":
                symbolType = operator.inverse;
                break;
            case "^":
                symbolType = operator.xor;
                if(this.codeInformation.getNowChar() === "=") {
                    symbolType = operator.xorEqual;
                    symbolOne += this.codeInformation.getTokenLengthAddOne();
                }
                break;
            case ",":
                symbolType = operator.comma;
                break;
            case ";":
                symbolType = type.semicolon;
                break;
            case "{":
                symbolType = brackets.braces.leftBraces;
                break;
            case "}":
                symbolType = brackets.braces.rightBraces;
                break;
            case "[":
                symbolType = brackets.middlebrackets.leftMiddlebrackets;
                break;
            case "]":
                symbolType = brackets.middlebrackets.rightMiddlebrackets;
                break;
            case "(":
                symbolType = brackets.parentheses.leftParentheses;
                break;
            case ")":
                symbolType = brackets.parentheses.rightParentheses;
                break;
        }
        this.codeInformation.setToken(start, this.codeInformation.codeStartLength - 1, symbolType, symbolOne);

    }

    /**
     * 用于处理注释
     */
    notes() {
        const start = this.codeInformation.codeStartLength;
        let notesOne = this.codeInformation.codeFirstChar;
        let notesType = "";
        this.codeInformation.codeStartLength++;
        switch (this.codeInformation.getNowChar()) {
            case "/":
                notesType = type.singleLineComment;
                while (this.codeInformation.getNowChar() &&
                    this.codeInformation.getNowChar() !== "\n") {
                    notesOne += this.codeInformation.getTokenLengthAddOne();
                }
                break;
            case "*":
                notesType = type.multilineComment;
                notesOne += this.codeInformation.getTokenLengthAddOne();
                while (this.codeInformation.getNowChar() !== "/"
                    || this.codeInformation.code[this.codeInformation.codeStartLength - 1] !== "*") {
                    //当出现换行是换行符加一
                    if (this.codeInformation.getNowChar() === '\n')
                        this.codeInformation.rowAddOne();
                    notesOne += this.codeInformation.getTokenLengthAddOne();
                }
                notesOne += this.codeInformation.getTokenLengthAddOne();
                break;
        }

        this.codeInformation.setToken(start, this.codeInformation.codeStartLength - 1, notesType, notesOne);
    }
    /**
     * 用于处理字符串
     */
    characterString() {
        /**
         * 避免分别处理 ' 和 "
         * @param {" or '} char
         */
        const codeInformation = this.codeInformation;

        function characterStringTool(char) {
            while (codeInformation.getNowChar() &&
                codeInformation.getNowChar() !== char) {
                if (codeInformation.getNowChar() === "\\") {
                    stringOne += codeInformation.getTokenLengthAddOne();
                }
                stringOne += codeInformation.getTokenLengthAddOne();
            }
        }

        const start = codeInformation.codeStartLength;
        let stringOne = codeInformation.getTokenLengthAddOne();
        switch (stringOne) {
            case "'":
                characterStringTool("'");
                break;
            case '"':
                characterStringTool('"');
                break;
        }

        if (codeInformation.getNowChar())
            stringOne += codeInformation.getTokenLengthAddOne();

        codeInformation.setToken(start, codeInformation.codeStartLength - 1, type.characterString, stringOne);
    }
    /**
     * 用于处理正则表达式
     */
    regular() {
        const start = this.codeInformation.codeStartLength;

        let regularOne = this.codeInformation.getTokenLengthAddOne();

        // 用于标记 /[/]/ 这种情况的发生
        let sign = false;
        while (this.codeInformation.getNowChar() &&
            (this.codeInformation.getNowChar() !== "/" || sign)) {
            const char = this.codeInformation.getNowChar();
            if (char === "[") {
                sign = true;
            }
            if (char === "]") {
                sign = false;
            }
            if (char === "\\") {
                regularOne += this.codeInformation.getTokenLengthAddOne();
            }

            regularOne += this.codeInformation.getTokenLengthAddOne();
        }
        regularOne += this.codeInformation.getTokenLengthAddOne();
        this.codeInformation.setToken(start, this.codeInformation.codeStartLength - 1, type.regular, regularOne);
    }
    /**
     * 用于处理特殊符号信息
     */
    specialSymbol() {
        switch (this.codeInformation.getNowChar()) {
            case "'":
            case '"':
                this.characterString();
                return;
            case '.':
                if (/[0-9]/.test(this.codeInformation.code[this.codeInformation.codeStartLength + 1])) {
                    this.number();
                } else {
                    this.symbol();
                }
                return;
        }
        switch (this.codeInformation.code[this.codeInformation.codeStartLength + 1]) {
            case "/":
            case "*":
                this.notes();
                break;
            default:
                let signLength = this.codeInformation.codeStartLength - 1;
                while (this.codeInformation.code[signLength] &&
                    this.codeInformation.code[signLength] === " ")
                    signLength--;
                let char = this.codeInformation.code[signLength];
                if (/[;\n\(=\+\-\*|&^]/.test(char) || !char ||
                    jsKey[this.codeInformation.tokens[this.codeInformation.tokens.length - 1].type]) {
                    this.regular();
                }
                else this.symbol();
        }
    }
    /**
     * 用于处理字符开头的token
     */
    character() {
        const start = this.codeInformation.codeStartLength;
        let stringOne = this.codeInformation.getTokenLengthAddOne();
        while (this.codeInformation.getNowChar() &&
            /[a-zA-Z0-9\_\$]/.test(this.codeInformation.getNowChar())) {
            stringOne += this.codeInformation.getTokenLengthAddOne();
        }
        let stringType = jsKey[stringOne];
        if (typeof stringType === "function") stringType = type.variableName;
        if (!stringType) stringType = type.variableName;
        this.codeInformation.trim();
        if (this.codeInformation.getNowChar() === "*") {
            if (type.isType(stringType, jsKey.function)) {
                stringType = jsKey["function*"];
                this.codeInformation.getTokenLengthAddOne();
            }
            if (type.isType(stringType, jsKey.yield)) {
                stringType = jsKey["yield*"];
                this.codeInformation.getTokenLengthAddOne();
            }
        }
        
        this.codeInformation.setToken(start, this.codeInformation.codeStartLength - 1, stringType, stringOne);
    }
}
