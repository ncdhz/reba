const rebaTools = require("reba-tools");

const type = rebaTools.type;
// 用于操作符号类型
const operator = type.operator;
// 用于括号类型
const brackets = type.brackets;
// 用于记录关键字
const jsKey = type.jsKey;

module.exports = class {

    constructor(codeInformation) {
        this.codeInformation = codeInformation;
    }
    // 用于处理空字符
    empty(){
        this.codeInformation.getNowChar();
    }
    /**
     * 用于分析以数字开头的字符
     */
    number(){
        const codeInformation = this.codeInformation;
        /**
         * 用于分析十进制数
         */
        function number10(){
            while(/[0-9\.eE]/.test(codeInformation.code[codeInformation.codeStartLength])&&
                codeInformation.code[codeInformation.codeStartLength]) {
                if(/[eE]/.test(codeInformation.code[codeInformation.codeStartLength])) {
                    numberOne += codeInformation.getNowChar();
                }
                numberOne += codeInformation.getNowChar();
            }
        }
        function number8And16(){
            while(/[a-fA-F0-9Xx]/.test(codeInformation.code[codeInformation.codeStartLength])&&
            codeInformation.code[codeInformation.codeStartLength]) {
            numberOne += codeInformation.getNowChar();
        }
        }
        const start = codeInformation.codeStartLength;
        let numberOne = codeInformation.getNowChar();
        switch(numberOne) {
            case '0':
                switch(codeInformation.code[codeInformation.codeStartLength]) {
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
        codeInformation.setToken( start, codeInformation.codeStartLength - 1, type.number,numberOne);
    }
    /**
     * 当词法分析器检测到是用$或_时使用的分析器
     */
    variableAna() {
        const start = this.codeInformation.codeStartLength;
        let variableName = this.codeInformation.getNowChar();
        while (this.codeInformation.codeStartLength < this.codeInformation.codeLength &&
            /[a-zA-Z\$0-9\_]/.test(this.codeInformation.code[this.codeInformation.codeStartLength])) {
            variableName += this.codeInformation.getNowChar();
        }
        this.codeInformation.setToken( start, this.codeInformation.codeStartLength - 1, type.variableName,variableName)
    }

    /**
     * 用与处理所有的符号
     */
    symbol() {
        const start = this.codeInformation.codeStartLength;
        let symbolOne = this.codeInformation.getNowChar();
        let symbolType;

        this.codeInformation.trimCode();

        switch (symbolOne) {
            case "+":
                symbolType = operator.add;
                switch (this.codeInformation.code[this.codeInformation.codeStartLength]) {
                    case "+":
                        symbolType = operator.addOne;
                        break;
                    case "=":
                        symbolType = operator.addEqual;
                        break;
                }
                if (symbolType !== operator.add)
                    symbolOne += this.codeInformation.getNowChar();
                break;
            case "-":
                symbolType = operator.reduce;
                switch (this.codeInformation.code[this.codeInformation.codeStartLength]) {
                    case "-":
                        symbolType = operator.reduceOne;
                        break;
                    case "=":
                        symbolType = operator.reduceEqual;
                        break;
                }
                if (symbolType !== operator.reduce)
                    symbolOne += this.codeInformation.getNowChar();
                break;
            case "*":
                symbolType = operator.ride;
                switch (this.codeInformation.code[this.codeInformation.codeStartLength]) {
                    case "=":
                        symbolType = operator.rideEqual;
                        break;
                    case "*":
                        symbolType = operator.involution;
                        break;
                }
                if (symbolType !== operator.ride)
                    symbolOne += this.codeInformation.getNowChar();
                break;
            case "/":
                symbolType = operator.except;
                switch (this.codeInformation.code[this.codeInformation.codeStartLength]) {
                    case "=":
                        symbolType = operator.exceptEqual;
                        symbolOne += this.codeInformation.getNowChar();
                        break;
                }
                break;
            case "%":
                symbolType = operator.remainder;
                switch (this.codeInformation.code[this.codeInformation.codeStartLength]) {
                    case "=":
                        symbolType = operator.remainderEqual;
                        symbolOne += this.codeInformation.getNowChar();
                        break;
                }
                break;
            case "=":
                symbolType = operator.equal;
                switch (this.codeInformation.code[this.codeInformation.codeStartLength]) {
                    case "=":
                        symbolOne += this.codeInformation.getNowChar();
                        symbolType = operator.remainderEqual;
                        this.codeInformation.trimCode();
                        if (this.codeInformation.code[this.codeInformation.codeStartLength] === "=") {
                            symbolType = operator.identity;
                            symbolOne += this.codeInformation.getNowChar();
                        }
                    case ">":
                        symbolOne += this.codeInformation.getNowChar();
                        symbolType = type.arrowFunction;
                        break;
                }
                break;
            case "!":
                symbolType = operator.logicInverse;
                switch (this.codeInformation.code[this.codeInformation.codeStartLength]) {
                    case "=":
                        symbolOne += this.codeInformation.getNowChar();
                        symbolType = operator.notEqual;
                        this.codeInformation.trimCode();
                        if (this.codeInformation.code[
                            this.codeInformation.codeStartLength
                        ] === "=") {
                            symbolType = operator.notIdentity;
                            symbolOne += this.codeInformation.getNowChar();
                        }
                        break;
                }
                break;
            case "<":
                symbolType = operator.less;
                switch (
                this.codeInformation.code[this.codeInformation.codeStartLength]
                ) {
                    case "=":
                        symbolType = operator.lessEqual;
                        break;
                    case "<":
                        symbolType = operator.leftShift;
                        break;
                }
                if (symbolType !== operator.less)
                    symbolOne += this.codeInformation.getNowChar();
                break;
            case ">":
                symbolType = operator.greater;
                switch (
                this.codeInformation.code[this.codeInformation.codeStartLength]
                ) {
                    case "=":
                        symbolType = operator.greaterEqual;
                        symbolOne += this.codeInformation.getNowChar();
                        break;
                    case ">":
                        symbolType = operator.signedRightShift;
                        symbolOne += this.codeInformation.getNowChar();
                        this.codeInformation.trimCode();
                        if (this.codeInformation.code[
                            this.codeInformation.codeStartLength
                        ] === ">") {
                            symbolType = operator.rightShift;
                            symbolOne += this.codeInformation.getNowChar();
                        }
                        break;
                }

                break;
            case "?":
            case ":":
                symbolType = operator.ternaryOperator;
                break;
            case ".":
                symbolType = operator.spot;
                break;
            case "&":
                symbolType = operator.add;
                switch (this.codeInformation.code[this.codeInformation.codeStartLength]) {
                    case "&":
                        symbolType = operator.logicAnd;
                        break;
                }
                if (symbolType !== operator.add)
                    symbolOne += this.codeInformation.getNowChar();
                break;
            case "|":
                symbolType = operator.or;
                switch (this.codeInformation.code[this.codeInformation.codeStartLength]) {
                    case "|":
                        symbolType = operator.logicOr;
                        break;
                }
                if (symbolType !== operator.or)
                    symbolOne += this.codeInformation.getNowChar();
                break;
            case "~":
                symbolType = operator.inverse;
                break;
            case "^":
                symbolType = operator.xor;
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
        this.codeInformation.setToken( start, this.codeInformation.codeStartLength - 1, symbolType,symbolOne);
        
    }

    /**
     * 用于处理注释
     */
    notes() {
        const start = this.codeInformation.codeStartLength;
        let notesOne = this.codeInformation.codeFirstChar;
        let notesType = "";
        this.codeInformation.codeStartLength++;
        switch (this.codeInformation.code[this.codeInformation.codeStartLength]) {
            case "/":
                notesType = type.singleLineComment;
                while (this.codeInformation.code[this.codeInformation.codeStartLength] &&
                    this.codeInformation.code[this.codeInformation.codeStartLength] !== "\n") {
                    notesOne += this.codeInformation.getNowChar();
                }
                break;
            case "*":
                notesType = type.multilineComment;
                notesOne += this.codeInformation.getNowChar();
                while (this.codeInformation.code[this.codeInformation.codeStartLength] !== "/"
                    || this.codeInformation.code[this.codeInformation.codeStartLength - 1] !== "*") {
                    notesOne += this.codeInformation.getNowChar();
                }
                notesOne += this.codeInformation.getNowChar();
                break;
        }

        this.codeInformation.setToken( start, this.codeInformation.codeStartLength - 1, notesType,notesOne);
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
            while (codeInformation.code[codeInformation.codeStartLength] &&
                codeInformation.code[codeInformation.codeStartLength] !== char) {
                if (codeInformation.code[codeInformation.codeStartLength] === "\\") {
                    stringOne += codeInformation.getNowChar();
                }
                stringOne += codeInformation.getNowChar();
            }
        }

        const start = codeInformation.codeStartLength;
        let stringOne = codeInformation.getNowChar();
        switch (stringOne) {
            case "'":
                characterStringTool("'");
                break;
            case '"':
                characterStringTool('"');
                break;
        }

        if (codeInformation.code[codeInformation.codeStartLength])
            stringOne += codeInformation.getNowChar();

        codeInformation.setToken( start, codeInformation.codeStartLength - 1, type.characterString,stringOne);
    }
    /**
     * 用于处理正则表达式
     */
    regular() {
        const start = this.codeInformation.codeStartLength;

        let regularOne = this.codeInformation.getNowChar();

        // 用于标记 /[/]/ 这种情况的发生
        let sign = false;
        while (this.codeInformation.code[this.codeInformation.codeStartLength] &&
            (this.codeInformation.code[this.codeInformation.codeStartLength] !== "/" || sign )) {
            const char = this.codeInformation.code[this.codeInformation.codeStartLength];
            if (char === "[") {
                sign = true;
            }
            if (char === "]") {
                sign = false;
            }
            if (char === "\\") {
                regularOne += this.codeInformation.getNowChar();
            }

            regularOne += this.codeInformation.getNowChar();
        }
        regularOne += this.codeInformation.getNowChar();
        this.codeInformation.setToken(start,this.codeInformation.codeStartLength - 1,type.regular,regularOne);
    }
    /**
     * 用于处理特殊符号信息
     */
    specialSymbol() {
        switch (this.codeInformation.code[this.codeInformation.codeStartLength]) {
            case "'":
            case '"':
                this.characterString();
                return;
            case '.':
                if(/[0-9]/.test(this.codeInformation.code[this.codeInformation.codeStartLength+1])) {
                    this.number();
                }else {
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
        let stringOne = this.codeInformation.getNowChar();
        while (this.codeInformation.code[this.codeInformation.codeStartLength] &&
            /[a-zA-Z1-9\_\$]/.test(this.codeInformation.code[this.codeInformation.codeStartLength])) {
            stringOne += this.codeInformation.getNowChar();
        }
        let stringType = jsKey[stringOne];
        if (!stringType) stringType = type.variableName;
        this.codeInformation.setToken(start,this.codeInformation.codeStartLength - 1,stringType,stringOne);
    }
};
