const rebaConfig = require("reba-parser-tools").config;
/**
 * 语法树的选择器
 */
module.exports = function (select){
    for (const key in rebaConfig) {
        if (rebaConfig.hasOwnProperty(key)) {
            const value = rebaConfig[key];
            select.push(value);
        }
    }
    return select;
}