const ExpressionType = require('./ExpressionType');
const TokenType = require('./TokenType');
const Expression = require('./Expression');
const JaxContext = require('./JaxContext');

const NBTM = require('./PrimitiveTypeMethods/NBTM');
const STM = require('./PrimitiveTypeMethods/StringTM');
const JaxFunction = require('./JaxFunction');
const JaxClass = require('./JaxClass');
const JaxObject = require('./JaxObject');

const fs = require('fs');
const JaxInstance = require("./JaxInstance");
const Lexer = require('./Lexer');
const Parser = require('./Parser');

function isstr(expression) {
    return (typeof expression == 'string');
}

function isnb(expression) {
    return (typeof expression == 'number' || typeof expression == 'boolean');
}

function truth(expression) {
    if (isnb(expression)) return !(expression==0||expression==false);
    return true;
}

class TreeInterpreter {

    visitors = {
        "UNARY": (expr, ctx) => {
            let rt = this.visit(expr.right, ctx);
            let op = expr.operator;
            if (op==TokenType.NEG) return !truth(op);
            if (isnb(rt)) {
                if (!op in NBTM) throw `Invalid Binary Operator for Number`
                return NBTM[op].get_member('_slf')(rt);
            }
            if (isstr(rt)) return STM[op].get_member('_slf')(rt);
        },
        "BINARY": (expr, ctx) => {
            let lt = this.visit(expr.left, ctx);
            let rt = this.visit(expr.right, ctx);
            let op = expr.operator;
            if (op==TokenType.NEG) return !truth(op);
            if (isnb(lt)) {
                if (!isnb(rt)) throw `Invalid Binary Operator between Number and Object`
                if (!op in NBTM) throw `Invalid Binary Operator for Number`
                return NBTM[op].get_member('_slf')(lt, rt);
            }
            if (isstr(lt)) {
                if (!isstr(rt)) throw `Invalid Binary Operator between String and Object`
                if (!op in STM) throw `Invalid Binary Operator for String`
                return STM[op].get_member('_slf')(lt, rt);
            }
        },
        "LITERAL": (expr, ctx) => {
            if (expr.type == TokenType.IDENTIFIER) return ctx.get_member(expr.value);
            return expr.value;
        },
        "CALL": (expr, ctx) => {
            let slf = this.visit(expr.reference, ctx);
            ctx.slf = slf;
            return slf.get_member('_slf')(this.visit(expr.args, ctx), ctx);
        },
        "TUPLE": (expr, ctx) => {
            if (expr.ev_all) {
                let j = [];
                for (let i of expr.expressions) j.push(this.visit(i, ctx));
                return j;
            }
            let j;
            for (let i of expr.expressions) j = this.visit(i, ctx);
            return j;
        },
        "ASSIGN": (expr, ctx) => {
            let opchain = [];
            let opr = expr.target;
            let val = this.visit(expr.value, ctx);
            while (opr.type == ExpressionType.CHILD) {
                opchain.push(opr.params.child.params.value)
                opr = opr.params.parent;
            }
            opchain.push(opr.params.value)
            if (opchain.length == 1) {
                if (opchain[0] == '#this') throw `Cannot Override #this`
                if (expr.operator == TokenType.COLON) {ctx.set_constant(opchain[0], val);return val;}
                if (expr.operator == TokenType.EQUAL) {ctx.set_value(opchain[0], val);return val;}
            }
            let vl;
            if (expr.operator == TokenType.COLON || expr.operator == TokenType.EQUAL) vl = val;
            else {
                let vr = this.visit(expr.target, ctx);
                if (isnb(vr)) {
                    if (!isnb(val)) throw `Invalid Binary Operator between Number and Object`
                    if (!expr.operator in NBTM) throw `Invalid Binary Operator for Number`
                    vl = NBTM[expr.operator].get_member('_slf')(vr, val);
                }
                else if (isstr(vr)) {
                    if (!isstr(val)) throw `Invalid Binary Operator between String and Object`
                    if (!expr.operator in STM) throw `Invalid Binary Operator for String`
                    vl = STM[expr.operator](vr, val);
                }
                else vl = vr.get_member(expr.operator).get_member('_slf')(this.visit(expr.target, ctx), val)
            };
            ctx.set_recursive(opchain, vl);
            return vl;
            
        },
        "CHILD": (expr, ctx) => {
            let par = this.visit(expr.parent, ctx);
            ctx.p = par;
            if (par.context) ctx.par = par;
            return par.get_member(expr.child.params.value);
        },
        "FUNCTION": (expr, ctx) => {
            return new JaxFunction((input, ctx) => {
                let _globcontext = ctx.global || ctx;
                if (ctx.par) _globcontext = ctx.par;
                let _ctx = new JaxContext(_globcontext);
                _ctx.set_value("#this", ctx.p);
                _ctx.set_constant("#len", input.length);
                _ctx._cinput = input;
                _ctx.set_constant('#', new JaxFunction((ip, cx) => {
                    if (ip.length == 0) throw `Invalid Input for #`
                    if (typeof ip[0] != 'number') throw `Invalid Input for #`
                    try {
                        return cx._cinput[ip[0]];
                    } catch {
                        throw `Out of Bounds`
                    }
                }))
                for (let i = 0; i < input.length; i++) {
                    _ctx.set_constant(`#${i}`, input[i]);
                }
                try {
                    this.visit(expr.execution, _ctx);
                } catch (error) {
                    if (error.return) return error.value;
                    throw error;
                }
            })
        },
        "WHILE": (expr, ctx) => {
            while (this.visit(expr.criterion, ctx)) this.visit(expr.block, ctx);
        },
        "BLOCK": (expr, ctx) => {
            for (let i of expr.statements) this.visit(i, ctx);
        },
        "RETURN": (expr, ctx) => {
            throw {
                return: true,
                value: this.visit(expr.value, ctx)
            }
        },
        "IF": (expr, ctx) => {
            if (truth(this.visit(expr.criterion, ctx))) {
                return this.visit(expr.trueblock, ctx);
            } else {
                if (expr.falseblock) return this.visit(expr.falseblock, ctx);
            }
        },
        "CLASS": (expr, ctx) => {
            let typec = {};
            for (let i in expr.typec) {
                typec[i] = this.visit(expr.typec[i], ctx);
            }
            let cls = new JaxClass(typec);
            cls.set_constant('_slf', (input, ctx) => {
                let obj = new JaxObject('Object', typec);

                ctx.p = obj;

                if ('_con' in typec) {
                    obj.get_member('_con').get_member('_slf')(input, ctx)
                }

                ctx.p = null;

                return obj;

            })
            return cls;
        },
        "INCLUDE": (expr, ctx) => {
            let r;
            try {
                r = fs.readFileSync(expr.path, "utf-8");
            } catch (error) {
                if (expr.path.startsWith('std:')) {
                    return ctx.__getbuiltin(expr.path);
                } else if (expr.path.startsWith('#std:')) {
                    ctx.addmodule("", ctx.__getbuiltin(expr.path.substring(1)));
                    return null;
                } else {
                    return null;
                }
            }

            let _ctx = new JaxContext();
            _ctx.__attachbuiltin();
            let instance = new JaxInstance(true, expr.path);
            let VM = new TreeInterpreter();
            VM.init(instance);
            
            let lexer = new Lexer(r, instance);
            lexer.scan();
            let tokens = lexer.tokens;
            let parser = new Parser(tokens, instance);
            let result = parser.parse();
            VM.visit(result, _ctx);
            return _ctx;

        }
    }

    /**
     * @param {Expression} expression
     */
    visit(expression, context=null) {
        //("CALLING", expression);
        if(context==null) context = new JaxContext();
        try {
            return this.visitors[expression.type](expression.params, context);
        } catch (error) {
            if (error==1) throw 1;
            if (error.return) throw error;
            this.instance.error(expression.line, error);
            this.instance.kill_if_error(1);
        }
        ctx.p = null;
        ctx.par = null;
    }

    init(instance) {
        this.instance = instance;
    }

}

/*
    CHILD: 'CHILD',
    ASSIGN: 'ASSIGN',
    FUNCTION: 'FUNCTION',
    IF: 'IF',
    WHILE: 'WHILE',
    BLOCK: 'BLOCK',
    RETURN: 'RETURN'
*/

module.exports = TreeInterpreter;