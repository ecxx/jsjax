const { getHashes } = require('crypto');
const JaxInstance = require('./JaxInstance');
const Token = require('./Token');
const TokenType = require('./TokenType');

module.exports = class Lexer {

    static escape_chars = {
        '0': '\0',
        '\\': '\\',
        "'": "'",
        '"': '"',
        '`': '`',
        'n': '\n',
        'r': '\r',
        't': '\t'
    }

    static reserved_words = {
        'include': TokenType.INCLUDE,
        'if': TokenType.IF,
        'else': TokenType.ELSE,
        'break': TokenType.BREAK,
        'continue': TokenType.CONTINUE,
        'for': TokenType.FOR,
        'of': TokenType.OF,
        'while': TokenType.WHILE,
        'fn': TokenType.FUNCTION,
        'class': TokenType.CLASS,
        'try': TokenType.TRY,
        'catch': TokenType.CATCH,
        'switch': TokenType.SWITCH,
        'case': TokenType.CASE,
        'fallthrough': TokenType.FALLTHROUGH,
        'null': TokenType.NULL,
        'true': TokenType.TRUE,
        'false': TokenType.FALSE,
        'return': TokenType.RETURN,
    }

    /**
     * 
     * @param {String} source 
     * @param {JaxInstance} instance
     */
    constructor(source, instance) {
        this.start = 0;
        this.current = 0;
        this.line = 1;

        this.instance = instance;

        this.tokens = [];
        this.source = source;

    }

    advance() {
        return this.source.charAt(this.current++);
    }

    matchChar(val) {
        if (this.end()) return false;
        if (this.source.charAt(this.current) == val) {this.advance(); return true;}
        return false;
    }

    peek() {
        if (this.end()) return '\0'
        return this.source.charAt(this.current);
    }

    addStandardToken(type) {
        this.addToken(type, null);
    }

    addToken(type, literal) {
        var text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));
    }

    end() {
        return (this.current >= this.source.length);
    }

    scan() {

        while (!this.end()) {
            this.scanToken();
        }

        this.addStandardToken(TokenType.EOF);

    }

    scanToken() {

        this.start = this.current;

        var c = this.advance();

        switch (c) {
            case '(':
                this.addStandardToken(TokenType.LEFT_PEREN);
                break;
            case ')':
                this.addStandardToken(TokenType.RIGHT_PEREN);
                break;
            case '[':
                this.addStandardToken(TokenType.LEFT_SQUARE);
                break;
            case ']':
                this.addStandardToken(TokenType.RIGHT_SQUARE);
                break;
            case '{':
                this.addStandardToken(TokenType.LEFT_BRACE);
                break;
            case '}':
                this.addStandardToken(TokenType.RIGHT_BRACE);
                break;
            case ',':
                this.addStandardToken(TokenType.COMMA);
                break;
            case '.':
                this.addStandardToken(TokenType.DOT);
                break;
            case ':':
                this.addStandardToken(TokenType.COLON);
                break;
            case '^':
                this.addStandardToken(TokenType.XOR);
                break;
            case '~':
                this.addStandardToken(TokenType.NOT);
                break;

            case '+':
                if (this.matchChar('=')) this.addStandardToken(TokenType.ADD_EQUAL);
                else this.addStandardToken(TokenType.ADD);
                break;

            case '-':
                if (this.matchChar('=')) this.addStandardToken(TokenType.SUB_EQUAL);
                else this.addStandardToken(TokenType.SUB);
                break;

            case '/':
                if (this.matchChar('=')) this.addStandardToken(TokenType.DIV_EQUAL);
                else if (this.matchChar('/')) {
                    while (this.peek() != '\n' && !this.end()) this.advance();
                }
                else this.addStandardToken(TokenType.DIV);
                break;

            case '*':
                if (this.matchChar('*')) this.addStandardToken(TokenType.EXP);
                else if (this.matchChar('=')) this.addStandardToken(TokenType.MUL_EQUAL);
                else this.addStandardToken(TokenType.MUL);
                break;

            case '%':
                if (this.matchChar('=')) this.addStandardToken(TokenType.MOD_EQUAL);
                else this.addStandardToken(TokenType.MOD);
                break;

            case '=':
                if (this.matchChar('=')) this.addStandardToken(TokenType.EQUAL_EQUAL);
                else this.addStandardToken(TokenType.EQUAL);
                break;

            case '!':
                if (this.matchChar('=')) this.addStandardToken(TokenType.NEG_EQUAL);
                else this.addStandardToken(TokenType.NEG);
                break;

            case '<':
                if (this.matchChar('=')) this.addStandardToken(TokenType.LESS_EQUALS);
                else if (this.matchChar('<')) this.addStandardToken(TokenType.LEFT_SHIFT);
                else this.addStandardToken(TokenType.LESS_THAN);
                break;

            case '>':
                if (this.matchChar('=')) this.addStandardToken(TokenType.GREATER_EQUALS);
                else if (this.matchChar('>')) this.addStandardToken(TokenType.RIGHT_SHIFT);
                else this.addStandardToken(TokenType.GREATER_THAN);
                break;

            case '&':
                if (this.matchChar('&')) this.addStandardToken(TokenType.AND_AND);
                else this.addStandardToken(TokenType.AND);
                break;

            case '|':
                if (this.matchChar('|')) this.addStandardToken(TokenType.OR_OR);
                else this.addStandardToken(TokenType.OR);
                break;

            case "'":
                this.scanString("'", false);
                break;
            
            case '"':
                this.scanString('"', false);
                break;
            
            case '`':
                this.scanString('`', true);
                break;

            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace.
                break;

            case '\n':
                this.line++;
                break;
            
            case ';':
                this.addStandardToken(TokenType.SEMICOLON);
                break;

            default:
                if (this.isDigit(c)) {
                    this.scanNumber();
                    return;
                }
                if (this.isLegalIdentifierCharacter(c)) {
                    this.scanIdentifier();
                    return;
                }
                this.instance.error(this.line, 'Unrecognised Token ' + c)
        }

    }

    scanString(firstChar, multiLine) {

        var string = ""

        while (this.peek() != firstChar && !this.end()) {

            if (this.peek() == '\n') {
                if (!allowMultiLine) this.instance.error(this.line, 'Unterminated String')
                line++;
                return;
            }

            if (this.peek() == '\\') {
                this.advance();
                var char = Lexer.escape_chars[this.peek()]
                if (char) string += char;
                else string += this.peek();
                this.advance();
            }
            else {
                string += this.peek();
                this.advance();
            }

        }

        if (this.end()) {

            this.instance.error(this.line, 'Unterminated String')

        }

        this.advance();

        this.addToken(TokenType.STRING, string)

    }

    isDigit(char) {
        if (char.match(/[0-9]/)) return true;
        return false;
    }

    scanNumber() {
        while (this.isDigit(this.peek())) this.advance();
        if (this.peek() == '.' && this.isDigit(this.source.charAt(this.current+1))) {
            this.advance();
            while (this.isDigit(this.peek())) this.advance();
        }
        this.addToken(TokenType.NUMBER, parseFloat(this.source.substring(this.start, this.current)))
    }

    isLegalIdentifierCharacter(char) {
        if (char.match(/[A-Za-z0-9#:_$]/)) return true;
        return false;
    }

    scanIdentifier() {
        while (this.isLegalIdentifierCharacter(this.peek())) this.advance();
        var identifier = this.source.substring(this.start, this.current)
        var keyword = Lexer.reserved_words[identifier];
        if (keyword) {
            this.addStandardToken(keyword);
        } else if (Lexer.reserved_words[identifier.toLowerCase()]) {
            this.instance.error(this.line, `${identifier} is not a valid identifier`)
        } else {
            this.addToken(TokenType.IDENTIFIER, identifier);
        }
    }

}