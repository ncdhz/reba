const selector = require("reba-traverser").selector;
const rebaConfig = require("reba-parser-tools").config;
class pluginParams {
    /**
     * @param {当前树} ast 
     * @param {父节点} parentNode 
     * @param {当前节点所在父节点的key} parentNodeKey
     * @param {和当前节点最近的数组} nodeArr 
     * @param {当前节点所在的数组编号} index 
     */
    constructor(ast, parentNode, parentNodeKey, nodeArr, index){
        this.ast = ast;
        this.parentNode = parentNode;
        this.parentNodeKey = parentNodeKey;
        this.nodeArr = nodeArr;
        this.index = index;
    }
}
/**
 * 用于遍历语法树
 */
module.exports = function (asts, pluginObj) {
    const select = new selector(pluginObj);
    for (const key in rebaConfig) {
        if (rebaConfig.hasOwnProperty(key)) {
            const value = rebaConfig[key];
            select.push(value);
        }
    }
    /**
     * 用于遍历语法树 asts
     * { 向下传递数据对象 } obj
     */
    const astErgodic = (obj) => {
        if (typeof obj.ast !== "object" || !obj.ast) {
            return;
        }
        if(obj.parentNode) {
            select.run(obj.ast.type, [obj]);
        }
        for(const key in obj.ast) {
            if (key === 'type') continue;
            let parentNode = obj.ast;
            let ast = obj.ast[key];
            if(ast instanceof Array) {
                let nodeArr = ast;                
                for (let index = 0; index < nodeArr.length; index++) {
                    astErgodic(new pluginParams(nodeArr[index], parentNode, key, nodeArr, index));
                }
            } else {
                astErgodic(new pluginParams(ast, parentNode, key, obj.nodeArr, obj.index));
            }      
        }
    }
    for (let index = 0; index < asts.length; index++) {
        astErgodic(new pluginParams(asts[index].ast));
    }
}