const lexical = require("reba-lexical");
const parser = require("reba-parser").rebaParser;
const generator = require("reba-generator").rebaGenerator;
const preset = require("reba-preset-env");
const { version } = require("../package.json");
/**
 * 根据源码和配置分配给不同的分析器分析
 * @param {源码} source 
 * @param {配置} config 
 */
function reba(source, config = undefined) {
    let lexicalConf = undefined;
    let generatorConf = undefined;
    let lexicalTest = false;
    let parserTest = false;
    let presetTest = false;
    if (typeof config === "object") {
        lexicalConf = config.lexical;
        generatorConf = config.generator;
        if (typeof config.test === "object") {
            lexicalTest = config.test.lexical;
            parserTest = config.test.parser;
            presetTest = config.test.preset;
        }
    }
    const tokenI = lexical(source, lexicalConf);
    if(lexicalTest) {
        console.log(JSON.stringify(tokenI, null, 4));
        return;
    }
    const asts = parser(tokenI);
    if (parserTest) {
        console.log(JSON.stringify(asts, null, 4));
        return;
    }
    preset(asts,{})
    if (presetTest) {
        console.log(JSON.stringify(asts, null, 4));
        return;
    }
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