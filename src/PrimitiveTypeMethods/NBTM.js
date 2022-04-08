const JaxFunction = require('../JaxFunction');

function tonum(x) {
    if (typeof x != "number" && typeof x != "boolean") throw `Error: Cannot add object to integer or boolean`
    if (x==true) return 1;
    if (x==false) return 0;
    return x;
}

const NBTM = {
    '_add': new JaxFunction((self, other) => {
        return tonum(self) + tonum(other);
    }),
    '_addq': new JaxFunction((self, other) => {
        return tonum(self) + tonum(other);
    }),
    '_sub': new JaxFunction((self, other) => {
        return tonum(self) - tonum(other);
    }),
    '_subq': new JaxFunction((self, other) => {
        return tonum(self) - tonum(other);
    }),
    '_mul': new JaxFunction((self, other) => {
        return tonum(self) * tonum(other);
    }),
    '_mulq': new JaxFunction((self, other) => {
        return tonum(self) * tonum(other);
    }),
    '_div': new JaxFunction((self, other) => {
        return tonum(self) / tonum(other);
    }),
    '_divq': new JaxFunction((self, other) => {
        return tonum(self) / tonum(other);
    }),
    '_mod': new JaxFunction((self, other) => {
        return tonum(self) % tonum(other);
    }),
    '_modq': new JaxFunction((self, other) => {
        return tonum(self) % tonum(other);
    }),
    '_usub': new JaxFunction((self) => {
        return -tonum(self);
    }),
    '_eql': new JaxFunction((self, other) => {
        return tonum(self) == tonum(other);
    }),
    '_neq': new JaxFunction((self, other) => {
        return tonum(self) != tonum(other);
    }),
    '_lt': new JaxFunction((self, other) => {
        return tonum(self) < tonum(other);
    }),
    '_gt': new JaxFunction((self, other) => {
        return tonum(self) > tonum(other);
    }),
    '_leq': new JaxFunction((self, other) => {
        return tonum(self) <= tonum(other);
    }),
    '_geq': new JaxFunction((self, other) => {
        return tonum(self) >= tonum(other);
    }),
    '_andb': new JaxFunction((self, other) => {
        return tonum(self) & tonum(other);
    }),
    '_orb': new JaxFunction((self, other) => {
        return tonum(self) | tonum(other);
    }),
    '_xorb': new JaxFunction((self, other) => {
        return tonum(self) ^ tonum(other);
    }),
    '_not': new JaxFunction((self) => {
        return ~tonum(self);
    }),
    '_lsb': new JaxFunction((self, other) => {
        return tonum(self) << tonum(other);
    }),
    '_rsb': new JaxFunction((self, other) => {
        return tonum(self) >> tonum(other);
    }),
    '_and': new JaxFunction((self, other) => {
        return self&&other;
    }),
    '_or': new JaxFunction((self, other) => {
        return self||other;
    })
}

module.exports = NBTM;