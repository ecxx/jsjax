class JaxObject {

    constructor(type, typecs) {
        this.typecs = typecs;
        this.type = type;
        this.constants = {};
        this.members = {};
    }

    set_constant(name, value) {
        if (name in this.typecs || name in this.constants || name in this.members) throw `Constant ${name} already set`;
        this.constants[name] = value;
    }

    set_value(name, value) {
        if (name in this.typecs || name in this.constants) throw `${value} is a constant and cannot be overriden.`;
        this.members[name] = value;
    }

    set_recursive(chain, value) {
        if (chain.length == 1) {this.set_value(chain[0], value); return;}
        let u = chain[chain.length - 1];
        if (u in this.typecs || u in this.constants) {
            throw `Constant cannot be overriden.`
        } 
        chain.pop();
        this.get_member(u).set_recursive(chain, value);
    }

    get_member(name) {
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

module.exports = JaxObject