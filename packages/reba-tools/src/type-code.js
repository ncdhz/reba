const os = require("os");

module.exports = {
    
    lineFeed: os.EOL,
    // 运算符
    operator: {
        
        binaryOperator: {
            // +
            add: "+",
            // -
            reduce: "-",
            // *
            ride: "*",
            // **
            involution: "**",
            // /
            except: "/",
            // %
            remainder: "%",
            // ==
            equalEqual: "==",
            // ===
            identity: "===",
            // !=
            notEqual: "!=",
            // !==
            notIdentity: "!==",
            // >
            greater: ">",
            // >=
            greaterEqual: ">=",
            // <
            less: "<",
            // <=
            lessEqual: "<=",
            // &
            and: "&",
            // |
            or: "|",
            // ^
            xor: "^",
            // <<
            leftShift: "<<",
            // >>>
            rightShift: ">>>",
            // >>
            signedRightShift: ">>",
        },
        updateOperator: {
            // ++
            addOne: "++",
            // --
            reduceOne: "--",
        },
        assignmentOperator: {
            // =
            equal: "=",
            // +=
            addEqual: "+=",
            // -=
            reduceEqual: "-=",
            // /=
            exceptEqual: "/=",
            // *=
            rideEqual: "*=",
            // %=
            remainderEqual: "%=",
            // >>>=
            rightShiftEqual: ">>>=",
            // >>=
            signedRightShiftEqual: ">>=",
            // <<=
            leftShiftEqual: "<<=",
            // &=
            andEqual: "&=",
            // |=
            orEqual: "|=",
            // ^=
            xorEqual: "^="
        },
        conditionalOperator: {
            // ? 
            questionMark: "?",
            // :
            colon: ":"
        },
        memberOperator: {
            // .
            spot: ".",
            // ?.
            optionalChaining: "?."
        },
        unaryOperator: {
            // !
            logicInverse: "!",
            // ~
            inverse: "~"
        },
        logicalOperator: {
            // &&
            logicAnd: "&&",
            // ||
            logicOr: "||"

        },
        sequenceOperator: {
            // ,
            comma: ","
        },
    },
    // ...
    spread: "...",
    // `
    template: "`",
    // ;
    semicolon: ";",
    // =>
    arrowFunction: "=>",
    // 括号
    brackets: {
        braces: {
            // {
            leftBraces: "{",
            // }
            rightBraces: "}"
        },
        middlebrackets: {
            // [
            leftMiddlebrackets: "[",
            // ]
            rightMiddlebrackets: "]"
        },
        parentheses: {
            // (
            leftParentheses: "(",
            // )
            rightParentheses: ")"
        }
    }
}