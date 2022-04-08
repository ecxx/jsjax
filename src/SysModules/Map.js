const JaxFunction = require("../JaxFunction");
const JaxObject = require("../JaxObject");
const reader = require('readline-sync');

function isstr(expression) {
    return (typeof expression == 'string');
}

function isnb(expression) {
    return (typeof expression == 'number' || typeof expression == 'boolean');
}

const JMapObjects = {
    '_slf': (input, ctx) => {
        try {
            return ctx.slf._val[input[0]]
        } catch {
            throw `Not Found`
        }
    },
    'get': new JaxFunction((input, ctx) => {
        try {
            return ctx.p._val[input[0]]
        } catch {
            throw `Not Found`
        }
    }),
    'set': new JaxFunction((input, ctx) => {
        return ctx.p._val[input[0]] = input[1]
    }),
}

class JMap extends JaxObject {

    constructor() {
        super('__jobject', JMapObjects);
    }

    set_recursive(chain, value) {
        if (chain.length == 1) {
            if (chain[0] in this.typecs || chain[0] in this.constants || chain[0] in this.members) {
                this.set_value(chain[0], value);
            }
            this._val[chain[0]] = value;
            return;
        }
        let u = chain[chain.length - 1];
        if (u in this.typecs || u in this.constants) {
            throw `Constant cannot be overriden.`
        } 
        chain.pop();
        this.get_member(u).set_recursive(chain, value);
    }

    get_member(name) {
        if (name in this._val) {
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

class JMapModule extends JaxObject {

    constructor() {
        super('__jmodule', {})
        this.constants['_slf'] = (input, ctx) => {
            let arr = new JMap();
            arr._val = {};
            return arr;
        }
    }

}

module.exports = JMapModule;