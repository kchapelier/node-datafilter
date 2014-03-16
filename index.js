var DataFilter = require('./lib/datafilter.js'),
    operators = require('./lib/operators.js');

operators(DataFilter); //inject default operators

module.exports = DataFilter;