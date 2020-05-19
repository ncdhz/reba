const rebaConfig = require("reba-tools").rebaConfig;
const lexical = require("reba-lexical");
const parser = require("reba-parser").rebaParser;
const generator = require("reba-generator").rebaGenerator;
const { version } = require("../package.json");
/**
 * 根据源码和配置分配给不同的分析器分析
 * @param {源码} source 
 * @param {配置} config 
 */
function reba(source, config = undefined) {
    let lexicalConf = undefined;
    let generatorConf = undefined;
    if (typeof config === "object") {
        lexicalConf = config.lexical;
        generatorConf = config.generator;
    }
    const tookenI = lexical(source, lexicalConf);
    const asts = parser(tookenI);
    const codes = generator(asts,generatorConf);
    codes.forEach((code)=>{
        console.log(code);
        console.log();
    })
}

module.exports = {
    version,
    reba
}