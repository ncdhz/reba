module.exports = {
    syntaxError:function(row, lexeme, filename){
        throw new Error("syntax error : { "+ (filename === ''?"source code ":"file name: [ "+
        filename+" ] ")+ "row:[ " + row + 
            " ]  lexeme: [ " + lexeme  +" ] }");
    }
}