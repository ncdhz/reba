class tokenInformation{

    constructor(filePath, tokens) {
        this.filePath = filePath;
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

    push(filePath, tokens){
        this.tokenInformations.push(new tokenInformation(filePath,tokens));
        return this;
    }
}