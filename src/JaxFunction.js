const JaxObject = require("./JaxObject");

class JaxFunction extends JaxObject {
    
    constructor(fun) {
        super('function', {});
        this.members['_slf'] = fun;
    }

}

module.exports = JaxFunction;