const analysis = require('./analysis-tools')
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
    
    while (codeInformation.getNowChar()) {
        // 词法分析选择器
        // 通过首元素找到对应的分析器并交给分析器
        const startChar = codeInformation.getNowChar();
        
        switch (true) {
            case /[0-9]/.test(startChar):
                ana.number();
                break;
            case /[\$\_]/.test(startChar):
                // 使用_和$开头的都是变量名
                ana.variableAna();
                break;
            case /[\+\-*%=!<>&|^,;{}[\]()\?:~]/.test(startChar):
                // 用于处理符号
                ana.symbol();
                break;
            case /[\/"'\.]/.test(startChar):
                // 用于处理特殊符号符号
                ana.specialSymbol();
                break;
            case /[a-zA-Z]/.test(startChar):
                // 用于处理字符开头的token
                ana.character();
                break;
            default :
                ana.empty();                
        }
        
        codeInformation.newCodeFirstChar();
    }
    return codeInformation.tokens;
}
module.exports = {
    getTokens
}