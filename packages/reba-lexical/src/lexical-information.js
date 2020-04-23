class tokenInformation{

    constructor(fileName, tokens) {
        this.fileName = fileName;
        this.tokens = tokens;
    }
    
}
module.exports =  class {
    
    constructor(isFile) {
        this.isFile = isFile;
        this.tokenInformations = []
    }

    setIsFile(isFile) {
       this.isFile = isFile;
       return this; 
    }

    push(fileName, tokens){
        this.tokenInformations.push(new tokenInformation(fileName,tokens));
        return this;
    }
}