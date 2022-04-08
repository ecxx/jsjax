const JaxFunction = require("./JaxFunction");
const JaxObject = require("./JaxObject");

class JaxClass extends JaxObject {

    constructor(typec) {
        super('__jclass', {});
        this.tpk = typec;
    }

}

module.exports = JaxClass;