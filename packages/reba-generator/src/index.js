const parser = require("reba-parser").parser;
const generatorTools = require("./generator.js");
const gf = require("./generator-file");
const generatorConfig = require("reba-tools").rebaConfig.generator;
/**
 * 根据语法树数组生成代码或者返回代码
 * @param {语法树数组} asts 
 */
function generatorCode(asts){
    const codes = [];
    asts.forEach((data) => {
        const code = generatorTools(data.ast, generatorConfig.alignmentSpace);
        if (generatorConfig.generateFile) {
            if (data.isFile) {
                gf(generatorConfig.generateFolder, data.filePath, code);
            } else {
                gf(generatorConfig.generateFolder, generatorConfig.defaultFileName, code);
            }
        } else {
            codes.push(code);
        }
    });
    return codes;
}
/**
 * 接受代码信息和配置信息解析成代码文件或者返回代码
 * @param {代码信息} information 
 * @param {配置信息} conf 
 */
function generator(information, conf = undefined){
    if(typeof conf === "object") {
        Object.assign(generatorConfig, conf.generator);
        conf = conf.lexical;
    }
    const asts = parser(information, conf);
    return generatorCode(asts);
}
/**
 * 根据语法树数组生成代码文件或者返回代码
 * @param {语法树数组} asts 
 * @param {配置信息} conf 
 */
function rebaGenerator(asts, conf) {
    Object.assign(generatorConfig, conf);
    return generatorCode(asts);
}

module.exports = {
    generator,
    rebaGenerator
}