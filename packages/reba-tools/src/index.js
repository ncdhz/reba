const type = require("./type");
const rebaConfig = require("./reba-config");
const configAnalysis = require("./config-analysis");
const conf = new configAnalysis();
module.exports = {
    type,
    rebaConfig
}