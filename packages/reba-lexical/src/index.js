const tokenizer = require("./tokenizer");
const lexicalInformation = require("./lexical-information");
const path = require("path");
const fs = require('fs');
const rebaTools = require('reba-tools');
const lexicalConfig = rebaTools.rebaConfig.lexical;

module.exports = function (information, config = undefined) {
    Object.assign(lexicalConfig, config);
    const lexicalInf = new lexicalInformation(false);
    /**
     * 通过文件夹名字遍历文件找到js类型文件生成token
     * @param {filePath} filePath 
     */
    function getDirToken(filePath) {
        const readDir = fs.readdirSync(path.join(information, filePath));
        readDir.forEach(function (fileName) {
            const p = path.join(filePath, fileName);
            const stat = fs.lstatSync(path.join(information, p));
            /**
             * 改变config可以改变读取文件类型
             * {
             *   fileType:"js"
             * }
             */
            if (stat.isFile() && path.basename(path.join(information, p)).endsWith(lexicalConfig.fileType)) {
                lexicalInf.push(p, tokenizer.getTokens(fs.readFileSync(path.join(information, p), 'utf8')));
            }
            if (stat.isDirectory()) {
                getDirToken(p);
            }
        })
    }
    /**
     * 当指定的config为
     * {
     *     file:false;
     * }
     * 得到的是源码information 是源码
     */
    if (!lexicalConfig.file) {
        const tokens = tokenizer.getTokens(information);
        return lexicalInf.push('', tokens);
    }

    const file = fs.lstatSync(information);
    if (file.isFile()) {
        const tokens = tokenizer.getTokens(fs.readFileSync(information, 'utf8'));
        return lexicalInf.setIsFile(true).push(path.basename(information), tokens);
    }
    if (file.isDirectory()) {
        lexicalInf.setIsFile(true);
        getDirToken("");
        return lexicalInf;
    }
}