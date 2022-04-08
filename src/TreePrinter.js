const ExpressionType = require('./ExpressionType');
const TokenType = require('./TokenType');
const Expression = require('./Expression');

class TreePrinter {

    visitors = {
        "UNARY": (expr) => {
            return '(' + expr.operator + ' ' + this.visit(expr.right) + ')'
        },
        "BINARY": (expr) => {
            return '(' + this.visit(expr.left) + ' ' + expr.operator + ' '+ this.visit(expr.right) + ')'
        },
        "LITERAL": (expr) => {
            return (expr.value)
        },
        "CHILD": (expr) => {
            return '(' + this.visit(expr.parent) + '.' + this.visit(expr.child) + ')'
        },
        "CALL": (expr) => {
            return this.visit(expr.reference) + '(' + this.visit(expr.args) + ')'
        },
        "TUPLE": (expr) => {
            let output = "("
            for (let i = 0; i < expr.expressions.length-1; i++) {
                output += this.visit(expr.expressions[i]) + ", "
            }
            output += this.visit(expr.expressions[expr.expressions.length-1]);
            output += ")"
            return output
        },
        "ASSIGN": (expr) => {
            return this.visit(expr.target) + ' ' + expr.operator + ' ' + this.visit(expr.value);
        }
    }

    /**
     * @param {Expression} expression
     */
    visit(expression) {

        if (expression==null) return ("(null)")
        return this.visitors[expression.type](expression.params);

    }

}

module.exports = TreePrinter;