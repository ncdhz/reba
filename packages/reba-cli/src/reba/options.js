const { Command } = require('commander');
const program = new Command();
const pkg = require("../../package.json");
const version = require("reba-core").version;

const config = {
    lexical: {},
    generator: {},
    test:{}
};

program.arguments('<source>').action(function (cmd) {
    config.source = cmd;
});

program.version(pkg.version + " (reba-core " + version + ")");

program.
    option("-ft, --file-type <fileType>", "Select file type").
    option("-f, --file", "Input content is file").
    option("-nf, --no-file", "Input content is not file").
    option("-as, --alignment-space <number>", "Number of aligned spaces").
    option("-d, --generate-folder <generateFolder>", "Output folder").
    option("-dfn, --default-file-name <defaultFileName>", "Source code default filename").
    option("-ngf, --no-generate-file", "Not generate files").
    option("-gf, --generate-file", "Generate files").
    option("-tl, --test-lexical", "Output lexical").
    option("-tp, --test-parser", "Output parser").
    option("-te, --test-env", "Output preset env");

module.exports = function parseArgv(args) {
    program.parse(args);
    
    if (program.fileType) {
        config.lexical["fileType"] = program.fileType;
    }
    if (program.file === false) { 
        config.lexical["file"] = program.file;
    }
    if (program.alignmentSpace) { 
        config.generator["alignmentSpace"] = program.alignmentSpace;
    }
    if (program.generateFolder) { 
        config.generator["generateFolder"] = program.generateFolder;
    }
    if (program.defaultFileName) { 
        config.generator["defaultFileName"] = program.defaultFileName;
    }
    if (program.generateFile === false) { 
        config.generator["generateFile"] = program.generateFile;
    }
    if (program.testLexical) {
        config.test["lexical"] = program.testLexical;
    }
    if (program.testParser) {
        config.test["parser"] = program.testParser;
    }
    if (program.testEnv) {
        config.test["preset"] = program.testEnv;
    }
    return config;
}