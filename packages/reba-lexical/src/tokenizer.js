const analysis = require('./analysis-tools')
const selector = require("reba-tools").selector;

const code = require('./code')
/**
 * 用于获取所有 tokens
 * @param {sourceCode} sourceCode 
 */
function getTokens(sourceCode) {
    // 全局信息
    const codeInformation = new code(sourceCode);
    // 构建一个词法分析器类
    const ana = new analysis(codeInformation);
    
    const select = new selector(ana);
    select.push("[0-9]", "number").
        push("[\\$\\_]", "variable").
        push("[\\+\\-*%=!<>&|^,;{}[\\]()\\?:~]", "symbol").
        push("[\\/\"'\\.]", "specialSymbol").
        push("[a-zA-Z]","character").openRegExp().
        push("[`]", "template").
        pushDefaultRun(function(){
            ana.empty();
        })
    while (codeInformation.getNowChar()) {
        // 词法分析选择器
        // 通过首元素找到对应的分析器并交给分析器
        const startChar = codeInformation.getNowChar();
        select.run(startChar);
        codeInformation.newCodeFirstChar();
    }
    return codeInformation.tokens;
}
module.exports = {
    getTokens
}