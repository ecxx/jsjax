const ExpressionType = require('./ExpressionType');

module.exports = class Expression {

    /**
     * 
     * @param {String} type 
     * @param {Object} parameters 
     */
    constructor(type, parameters, line) {
        this.type = type;
        this.params = parameters;
        this.line = line;
    }

    accept(visitor) {
        return visitor[type](this);
    }

    static binary(left, operator, right, line) {
        let expr = new Expression(ExpressionType.BINARY, {
            left: left,
            operator: operator,
            right: right
        }, line);

        return expr;
    }

    static unary(operator, right, line) {
        let expr = new Expression(ExpressionType.UNARY, {
            operator: operator,
            right: right
        }, line);

        return expr;
    }

    static literal(value, type, line) {
        let expr = new Expression(ExpressionType.LITERAL, {
            type: type,
            value: value
        }, line);

        return expr;
    }

    static tuple(expression_array, ev_all, line) {
        let expr = new Expression(ExpressionType.TUPLE, {
            expressions: expression_array,
            ev_all: ev_all
        }, line);

        return expr;
    }

    static call(reference, args, line) {
        let expr = new Expression(ExpressionType.CALL, {
            reference: reference,
            args: args
        }, line);

        return expr;
    }

    static child(parent, child, line) {
        let expr = new Expression(ExpressionType.CHILD, {
            parent: parent,
            child: child
        }, line);

        return expr;
    }

    static assign(target, operator, value, line) {
        let expr = new Expression(ExpressionType.ASSIGN, {
            target: target,
            operator: operator,
            value: value
        }, line);

        return expr;
    }

    static fn(inputs, execution, line) {
        let expr = new Expression(ExpressionType.FUNCTION, {
            inputs: inputs,
            execution: execution
        }, line);

        return expr;
    }

    static ifstmt(criterion, trueblock, falseblock, line) {
        let expr = new Expression(ExpressionType.IF, {
            criterion: criterion,
            trueblock: trueblock,
            falseblock: falseblock
        }, line);

        return expr;
    }

    static whilestmt(criterion, block, line) {
        let expr = new Expression(ExpressionType.WHILE, {
            criterion: criterion,
            block: block,
        }, line);

        return expr;
    }

    static ret(value, line) {
        let expr = new Expression(ExpressionType.RETURN, {
            value: value
        }, line);

        return expr;
    }

    static block(statements, line) {
        let expr = new Expression(ExpressionType.BLOCK, {
            statements: statements
        }, line);

        return expr;
    }

    static cls(typec, line) {
        let expr = new Expression(ExpressionType.CLASS, {
            typec: typec
        }, line);

        return expr;
    }

    static include(path, line) {
        let expr = new Expression(ExpressionType.INCLUDE, {
            path: path
        }, line);

        return expr;
    }

}