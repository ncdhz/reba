// 用于装token的对象
module.exports = class token {
    constructor(start, end, type, lexeme) {
        this.type = type;
        this.lexeme = lexeme;
        this.position = {
            start,
            end
        };
    }
    
}