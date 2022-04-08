const JaxFunction = require("../JaxFunction");
const JaxObject = require("../JaxObject");

function isstr(expression) {
    return (typeof expression == 'string');
}

function isnb(expression) {
    return (typeof expression == 'number' || typeof expression == 'boolean');
}

class JClock extends JaxObject {

    constructor() {
        super('__jmodule', {});

        this.constants['clock'] = new JaxFunction((input, ctx) => {
            return Math.floor(new Date()/1000);
        })
        
        this.constants['clock_milli'] = new JaxFunction((input, ctx) => {
            return Math.floor(new Date());
        })        
        
    }

}

module.exports = JClock;