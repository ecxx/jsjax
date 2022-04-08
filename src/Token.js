const TokenType = require('./TokenType')

module.exports = class Token {

    /**
     * 
     * @param {Object} Type 
     * @param {String} Lexeme 
     * @param {Object} Literal 
     * @param {Number} Line 
     */
    constructor(Type, Lexeme, Literal, Line) {

        this.type = Type; 
        this.lexeme = Lexeme; 
        this.literal = Literal; 
        this.line = Line;

    }

    log() {
        console.log(`(Line ${this.line}) ${this.type} : Lexeme {${this.lexeme}} Literal {${this.literal || 'none'}}`);
    }

}