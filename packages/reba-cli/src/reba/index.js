#!/usr/bin/env node
const parseArgv = require("./options");
const reba = require("reba-core").reba;
const config = parseArgv(process.argv);
reba(config.source,config);