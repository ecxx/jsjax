const JaxFunction = require("../JaxFunction");
const JaxObject = require("../JaxObject");
const reader = require('readline-sync');

function isstr(expression) {
    return (typeof expression == 'string');
}

function isnb(expression) {
    return (typeof expression == 'number' || typeof expression == 'boolean');
}

class JMath extends JaxObject {

    constructor() {
        super('__jmodule', {});

        this.constants['print'] = new JaxFunction((input, ctx) => {
            if (isstr(input[0]) || isnb(input[0]) || input[0]==null)
                console.log(`${input[0]}`);
            else if ('_string' in input[0].typec) {
                console.log(input[0].get_member('_string')['_slf']([], ctx));
            }
            else console.log(`[object of type ${input[0].type}]`)
        })

        this.constants['read'] = new JaxFunction((input, ctx) => {
            if (input.length == 0) input.push('')
            return reader.question(input[0]);
        })

        this.constants['readint'] = new JaxFunction((input, ctx) => {
            if (input.length == 0) input.push('')
            return parseInt(reader.question(input[0]));
        })

        this.constants['readfloat'] = new JaxFunction((input, ctx) => {
            if (input.length == 0) input.push('')
            return parseFloat(reader.question(input[0]));
        })
        
    }

}

module.exports = JMath;