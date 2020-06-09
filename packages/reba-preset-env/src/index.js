const ergodic = require("reba-traverser").ergodic;
const { dependencies } = require("../package.json");
module.exports = function run(ast, config) {
    const plugin = {};
    for (const key in dependencies) {
        let dependencie = require(key);
        if (typeof dependencie === "object" &&
            dependencie.hasOwnProperty("name") &&
            dependencie.hasOwnProperty("value")) {
            const name = dependencie["name"];

            if (name instanceof Array) {
                for (let i = 0; i < name.length; i++) {
                    if (typeof name[i] === "string") {
                        plugin[name[i]] = dependencie["value"];
                    }
                }
            } else if (typeof name === "string") {
                plugin[name] = dependencie["value"];
            }

        }
    }
    if (typeof config === "object") {
        Object.assign(plugin, config);
    }
    ergodic(ast, plugin);
}