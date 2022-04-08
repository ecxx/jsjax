const JArray = require('./Array')
const Clock = require('./Clock')
const IO = require('./IO')
const JMap = require('./Map')

module.exports = {
    'std:clock': new Clock(),
    'std:io': new IO(),
    'std:array': new JArray(),
    'std:map': new JMap()
}