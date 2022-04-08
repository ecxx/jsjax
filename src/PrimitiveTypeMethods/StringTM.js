const JaxFunction = require('../JaxFunction');

const StringTM = {
    '_add': new JaxFunction((self, other) => {
        return self + other;
    }),
    '_addq': new JaxFunction((self, other) => {
        return self + other;
    }),
}

module.exports = StringTM;