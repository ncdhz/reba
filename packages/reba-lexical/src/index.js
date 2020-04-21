const tokenizer = require("./tokenizer");
const lexicalInformation = require("./lexical-information");
const path = require("path");
const fs = require('fs');
const rebaTools = require('reba-tools');

module.exports = function (information,conf) {
    const lexicalInf = new lexicalInformation(false);
    /**
     * 通过文件夹名字遍历文件找到js类型文件生成token
     * @param {filePath} filePath 
     */
    function getDirToken(filePath) {
        const readDir = fs.readdirSync(filePath );
        readDir.forEach(function (fileName){
            const p = path.join(filePath, fileName);
            const stat = fs.lstatSync(p);  
            if(stat.isFile() && path.basename(p).endsWith(rebaTools.rebaConfig.reba.lexical.fileType)) {
                lexicalInf.push(p,tokenizer.getTokens(fs.readFileSync(p,'utf8')));
            }
            if(stat.isDirectory()) {
                getDirToken(p);
            }
        })
    }
    // 当conf为s时 information 是源码
    if(conf && conf === 's') {
        const tokens = tokenizer.getTokens(information);
        return lexicalInf.push('', tokens);
    }
    const file = fs.lstatSync(information);
    if(file.isFile()) {
        const tokens = tokenizer.getTokens(fs.readFileSync(information,'utf8'));
        return lexicalInf.setIsFile(true).push(path.basename(information), tokens);
    } 
    if (file.isDirectory()) {
        lexicalInf.setIsFile(true);
        getDirToken(information);
        return lexicalInf;
    }
}