const type = require("./type");
const rebaConfig = require("./reba-config");
const configAnalysis = require("./config-analysis");
const selector = require("./selector");
const conf = new configAnalysis();
module.exports = {
    type,
    rebaConfig,
    selector
}