var DataFilter = require('./lib/datafilter'),
    operators = require('./lib/operators');

operators(DataFilter); //inject default operators

module.exports = DataFilter;
