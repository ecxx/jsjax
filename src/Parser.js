const Token = require('./Token');
const TokenType = require('./TokenType');
const Expression = require('./Expression');
const JaxInstance = require('./JaxInstance');
const ExpressionType = require('./ExpressionType');
const { NUMBER } = require('./TokenType');

class Parser {

    /**
     * 
     * @param {Array<Token>} tokens 
     * @param {JaxInstance} instance
     */
    constructor(tokens, instance) {
        this.tokens = tokens;
        this.current = 0;
        this.instance = instance;
    }

    end() {
        return this.tokens[this.current].type == TokenType.EOF;
    }

    nearend() {
        return this.end() || this.tokens[this.current+1].type == TokenType.EOF;
    }

    advance() {
        if (!this.end()) this.current++;
        return this.previous();
    }

    peek() {
        return this.tokens[this.current];
    }

    previous() {
        return this.tokens[this.current - 1];
    }

    check(type) {
        return this.peek().type == type;
    }

    advancecheck(type) {
        return this.tokens[this.current+1].type == type;
    }

    advancecheck_a(...types) {
        for (let type of types) {
            if (this.advancecheck_a(type)) return true;
        }
        return false;
    }

    match_array(types) {
        for (let type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    match(...types) {
        return this.match_array(types);
    }

    consume(type, message) {
        if (this.check(type)) this.advance();
        else {
            this.instance.error(this.peek().line, message);
            throw message;
        }
    }

    sync() {
        this.advance();

        while(!this.end()) {
            if (this.previous().type == TokenType.SEMICOLON) return;
            if ([
                TokenType.INCLUDE, TokenType.IF,
                TokenType.BREAK, TokenType.CONTINUE,
                TokenType.FOR, TokenType.WHILE,
                TokenType.TRY, TokenType.SWITCH,
                TokenType.FALLTHROUGH
            ].indexOf(this.peek().type) != -1) {
                return;
            }

            this.advance();
        }
    }

    parse() {
        let blocks = []
        while (!this.end()) {
            try {
                blocks.push(this.block());
            } catch (error) {
                this.instance.error(this.previous().line, error)
                this.sync();
            }
        }
        if (blocks.length == 1) return blocks[0];
        return Expression.block(blocks);
    }

    expression() {
        return this.tuple();
    }

    primitive() {
        if (this.match(TokenType.TRUE)) return Expression.literal(true, "BOOLEAN", this.previous().line);
        if (this.match(TokenType.FALSE)) return Expression.literal(false, "BOOLEAN"), this.previous().line;
        if (this.match(TokenType.NULL)) return Expression.literal(null, "NULL", this.previous().line);
        if (this.match(TokenType.NUMBER, TokenType.STRING, TokenType.IDENTIFIER)) 
            return Expression.literal(this.previous().literal, this.previous().type, this.previous().line);

        if (this.match(TokenType.LEFT_PEREN)) {
            let expr = this.expression();
            this.consume(TokenType.RIGHT_PEREN, "Expected ')' after expression");
            return expr;
        }

        this.instance.error(this.peek().line, "Expected an expression here");
        throw "Expected an expression here";
        
    }

    call() {
        let primary = this.primitive();
        while (this.match(TokenType.DOT, TokenType.LEFT_PEREN, TokenType.LEFT_SQUARE)) {
            if (this.previous().type == TokenType.LEFT_PEREN) {
                let inner = this.strict_tuple();
                this.consume(TokenType.RIGHT_PEREN, "Expected ')' after function call");
                primary = Expression.call(primary, inner, primary.line);
            } else if (this.previous().type == TokenType.LEFT_SQUARE) {
                let secondary = this.primitive();
                if (secondary.type != ExpressionType.LITERAL) throw "Invalid member access"
                this.consume(TokenType.RIGHT_SQUARE, "Expected ']' after member access");
                primary = Expression.child(primary, secondary, primary.line);
            } else {
                let secondary = this.primitive();
                if (secondary.type == ExpressionType.LITERAL && secondary.params.type != TokenType.IDENTIFIER) throw "Invalid child operator"
                primary = Expression.child(primary, secondary, primary.line);
            }
        }
        return primary;
    }

    unary() {
        if (this.match(TokenType.NEG, TokenType.SUB, TokenType.NOT)) {
            let typ = this.previous().type;
            if (typ == TokenType.SUB) typ = '_usub';
            let right = this.unary();
            return Expression.unary(typ, right, right.line);
        }
        return this.call();
    }

    inferior(elevel) {
        let levels = ["assign", "logop", "bitop", "equality", "comparison", "bitshift", "linear", "factor", "unary"]
        return levels[levels.indexOf(elevel) + 1]
    }

    operators(elevel) {
        return {
            "assign": [TokenType.EQUAL, TokenType.ADD_EQUAL, TokenType.SUB_EQUAL, TokenType.MUL_EQUAL, TokenType.DIV_EQUAL, TokenType.MOD_EQUAL, TokenType.COLON],
            "logop": [TokenType.AND_AND, TokenType.OR_OR],
            "bitop": [TokenType.AND, TokenType.OR, TokenType.XOR],
            "equality": [TokenType.EQUAL_EQUAL, TokenType.NEG_EQUAL],
            "comparison": [TokenType.LESS_THAN, TokenType.LESS_EQUALS,
                           TokenType.GREATER_THAN, TokenType.GREATER_EQUALS],
            "bitshift": [TokenType.LEFT_SHIFT, TokenType.RIGHT_SHIFT],
            "linear": [TokenType.ADD, TokenType.SUB],
            "factor": [TokenType.MUL, TokenType.DIV, TokenType.MOD, TokenType.EXP]
        }[elevel]
    }

    sbinary(elevel) {
        if (elevel == "unary") return this.unary();
        let left = this.sbinary(this.inferior(elevel));
        if (this.match_array(this.operators(elevel))) {
            let typ = this.previous().type;
            let right = this.sbinary(elevel);;
            if (elevel == "assign") {
                if (this.check_is_reference(left)) return Expression.assign(left, typ, right, left.line);
                throw `Invalid Assignment Operation`
            }
            return Expression.binary(left, typ, right, left.line);
        }
        return left;
    }

    obj() {
        if (this.match(TokenType.INCLUDE)) return this.include();
        if (this.match(TokenType.FUNCTION)) return this.fn();
        if (this.match(TokenType.CLASS)) return this.cls();
        return this.sbinary("logop");
    }

    assign() {
        let left = this.obj();
        if (this.match_array(this.operators('assign'))) {
            let typ = this.previous().type;
            let right = this.assign();
            if (this.check_is_reference(left)) return Expression.assign(left, typ, right, left.line);
            throw `Invalid Assignment Operation`
        }
        return left;
    }

    strict_tuple() {
        if (this.check(TokenType.RIGHT_PEREN)) {
            return Expression.tuple([], true, this.previous().line);
        }
        let tarray = [this.assign()];
        while (this.match(TokenType.COMMA)) {
            tarray.push(this.assign());
        }
        return Expression.tuple(tarray, true, tarray[0].line);
    }

    tuple() {
        let contains_multiple = false;
        let tarray = [this.assign()];
        while (this.match(TokenType.COMMA)) {
            contains_multiple = true;
            tarray.push(this.assign());
        }
        return contains_multiple ? Expression.tuple(tarray, false, tarray[0].line) : tarray[0];
    }

    fn() {
        let params;
        let execution = this.block();
        return Expression.fn(params, execution, execution.line);
    }

    cls() {
        this.consume(TokenType.LEFT_BRACE, `Require { to begin class`)
        let ln = this.previous().line;
        let typec = {}
        while (!this.match(TokenType.RIGHT_BRACE)) {    
            if (this.end()) throw `Unclosed {`
            if (!this.match(TokenType.IDENTIFIER)) {
                throw `Invalid Class Parameter Name`
            }
            let nm = this.previous().literal;
            if (!this.match(TokenType.COLON)) {
                throw `Class Parameter must be followed with constant assignment`
            }
            let vc = this.obj();
            typec[nm] = vc;
        }
        return Expression.cls(typec, ln);
    }

    ifstmt() {
        let criterion = this.expression();
        let execution = this.block();
        let elsestmt
        if (this.match(TokenType.ELSE)) {
            elsestmt = this.block();
        } else {
            elsestmt = false;
        }
        return Expression.ifstmt(criterion, execution, elsestmt, criterion.line);
    }

    whilestmt() {
        let criterion = this.expression();
        let execution = this.block();
        return Expression.whilestmt(criterion, execution, criterion.line); 
    }

    include() {
        if (!this.match(TokenType.STRING, TokenType.IDENTIFIER)) {
            throw `Invalid Include`;
        }
        return Expression.include(this.previous().literal, this.previous().line)
    }

    statement() {
        while(this.match(TokenType.SEMICOLON)) {}
        if (this.match(TokenType.IF)) return this.ifstmt();
        if (this.match(TokenType.WHILE)) return this.whilestmt();
        if (this.match(TokenType.RETURN)) {let exp = this.expression();
            return Expression.ret(exp, exp.line) 
        };
        return this.expression();
    }

    block() {
        let ln;
        if (this.match(TokenType.LEFT_BRACE)) {
            ln = this.previous().line;
            let statements = [];
            while (!this.match(TokenType.RIGHT_BRACE)) {
                if (this.end()) throw `Unclosed {`
                statements.push(this.statement());
            }
            if (statements.length == 1) return statements[0];
            return Expression.block(statements, ln);
        }
        return this.statement();
    }

    check_is_reference(expression) {
        if (expression.type == ExpressionType.LITERAL && expression.params.type == 'IDENTIFIER') return true;
        if (expression.type != ExpressionType.CHILD ) return false;
        return this.check_is_reference_child(expression.params.child) && this.check_is_reference_child(expression.params.parent);
    }

    check_is_reference_child(expression) {
        if (expression.type == ExpressionType.LITERAL) return true;
        if (expression.type != ExpressionType.CHILD ) return false;
        return this.check_is_reference_child(expression.params.child) && this.check_is_reference_child(expression.params.parent);
    }

}

module.exports = Parser;