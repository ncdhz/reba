const selector = require("./selector");
const traverser = require("./traverser");
/**
 * 用于遍历语法树
 */
module.exports = function(ast, obj){
    const select =new selector(obj);
    traverser(select);
    const astErgodic = (tree)=>{
        if(typeof tree === "object") {
            select.run(tree.type, tree);
            for (const key in tree) {
                if (key !== 'type') {
                    astChange(tree[key]);
                }
            }
        }
    }
    astErgodic(ast);
}