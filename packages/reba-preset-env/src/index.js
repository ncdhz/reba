const ergodic = require("reba-traverser").ergodic;

module.exports = function run( config ){
    
    if(typeof config === "object") {
        Object.assign(presetEnv.plugin, config.plugin);
    }
    ergodic(ast, presetEnv.plugin);

}