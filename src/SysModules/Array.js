const JaxFunction = require("../JaxFunction");
const JaxObject = require("../JaxObject");
const reader = require('readline-sync');

function isstr(expression) {
    return (typeof expression == 'string');
}

function isnb(expression) {
    return (typeof expression == 'number' || typeof expression == 'boolean');
}

const JArrayObjects = {
    'push': new JaxFunction((input, ctx) => {
        try {
            ctx.p._val.push(input[0]);
            return input[0];
        } catch {
            throw `Too few inputs for array push`
        }
    }),
    '_slf': (input, ctx) => {
        try {
            return ctx.slf._val[input[0]]
        } catch {
            throw `Too few inputs for array get, or array out of bounds error`
        }
    },
    'get': new JaxFunction((input, ctx) => {
        try {
            return ctx.p._val[input[0]]
        } catch {
            throw `Too few inputs for array get, or array out of bounds error`
        }
    }),
    'set': new JaxFunction((input, ctx) => {
        try {
            return ctx.p._val[input[0]] = input[1]
        } catch (error) {
            throw `Too few inputs for array set, or array out of bounds error`
        }
    })
}

class JArray extends JaxObject {

    constructor() {
        super('__jobject', JArrayObjects);
    }

    set_recursive(chain, value) {
        if (chain.length == 1) {
            if (chain[0] in this.typecs || chain[0] in this.constants || chain[0] in this.members) {
                this.set_value(chain[0], value);
            }
            if(this._val.hasOwnProperty(chain[0]) && typeof chain[0] == 'number') this._val[chain[0]] = value;
            throw `Invalid Argument`
        }
        let u = chain[chain.length - 1];
        if (u in this.typecs || u in this.constants) {
            throw `Constant cannot be overriden.`
        } 
        chain.pop();
        this.get_member(u).set_recursive(chain, value);
    }

    get_member(name) {
        if (this._val.hasOwnProperty(name) && typeof name == 'number') {
            return this._val[name];
        }
        if (name in this.typecs) {
            return this.typecs[name];
        }
        if (name in this.constants) {
            return this.constants[name];
        }
        if (name in this.members) {
            return this.members[name];
        }
        if (this.global) {
            return this.global.get_member(name);
        }
        if (this.context) {
            throw `No variable ${name} defined`
        }
        throw `No member ${name} of ${this.type}`
    }

}

class JArrayModule extends JaxObject {

    constructor() {
        super('__jmodule', {})
        this.constants['_slf'] = (input, ctx) => {
            let arr = new JArray();
            arr._val = [];
            if (input[0] instanceof JArray) {
                arr._val = input[0]._val;
            }
            if (typeof input[0] == 'number') {
                arr._val = Array.apply(null, Array(input[0])).map(function () {return 0;})
            }
            return arr;
        }
    }

}

module.exports = JArrayModule;
