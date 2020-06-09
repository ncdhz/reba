const ergodic = require("reba-traverser").ergodic;
const { dependencies } = require("../package.json");
module.exports =  function run(ast,config){
    const plugin = {};
    for (const key in dependencies) {
        let dependencie = require(key);
        if (typeof dependencie === "object" && 
            dependencie.hasOwnProperty("name") &&
            dependencie.hasOwnProperty("value")) {
            plugin[dependencie["name"]] = dependencie["value"];
        }
    }
    if(typeof config === "object") {
        Object.assign(plugin, config);
    }
    ergodic(ast, plugin);
}