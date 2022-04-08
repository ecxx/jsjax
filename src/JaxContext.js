const JaxObject = require("./JaxObject");
const SModules = require('./SysModules/SModules');

class JaxContext extends JaxObject {

    constructor(global=null) {
        super('__jcontext', {});
        this.constants['global'] = global;
        this.global = global;
        this.context = true;
        this.p = null;
        this.modules = {};
    }

    addmodule(name, module) {
        if (name=="") {
            for (let nm in module.constants) {
                this.set_constant(nm, module.constants[nm]);
            }
        }
        this.set_constant(name, module);
    }

    __attachbuiltin() {
        for (let name in SModules) {
            this.modules[name] = SModules[name];
        }
    }

    __getbuiltin(name) {
        if (name in this.modules) return this.modules[name];
        else if (this.global && name in this.global.modules) return this.global.modules[name];
        else throw `Module ${name} not found`
    }
    
}

module.exports = JaxContext;