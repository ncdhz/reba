const fs = require("fs");
const path = require("path");
/**
 * 同步的构建文件夹
 * @param {文件路径} dirname 
 */
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}
/**
 * 用于创建文件并写入数据
 * @param {文件路径} filePath
 * @param {文件内容} context
 */
module.exports =function (fileDir, filePath, context) {
    filePath = path.join(fileDir, filePath);
    const dir = path.dirname(filePath);
    mkdirsSync(dir);
    fs.writeFileSync(filePath, context);
}