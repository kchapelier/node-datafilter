var defineDefaultOperators = function(DataFilter) {
    "use strict";

    DataFilter.addOperator(
        'greater than',
        function(fieldValue, filterValue) {
            return (fieldValue > filterValue);
        }
    );

    DataFilter.addOperator(
        'greater than or equal',
        function(fieldValue, filterValue) {
            return (fieldValue >= filterValue);
        }
    );

    DataFilter.addOperator(
        'less than',
        function(fieldValue, filterValue) {
            return (fieldValue < filterValue);
        }
    );

    DataFilter.addOperator(
        'less than or equal',
        function(fieldValue, filterValue) {
            return (fieldValue <= filterValue);
        }
    );

    DataFilter.addOperator(
        'equal',
        function(fieldValue, filterValue) {
            return (fieldValue == filterValue);
        }
    );

    DataFilter.addOperator(
        'strict equal',
        function(fieldValue, filterValue) {
            return (fieldValue === filterValue);
        }
    );

    DataFilter.addOperator(
        'contains',
        function(fieldValue, filterValue) {
            return (typeof(fieldValue) === 'string' && fieldValue.indexOf(filterValue) >= 0);
        }
    );

    DataFilter.addOperator(
        'array contains',
        function(fieldValue, filterValue) {
            return (Array.isArray(fieldValue) && fieldValue.indexOf(filterValue) >= 0);
        }
    );

    DataFilter.addOperator(
        'regexp',
        function(fieldValue, filterValue) {
            if(typeof filterValue === 'string') {
                filterValue = new RegExp(filterValue);
            }

            return (typeof(filterValue.test) === 'function' && filterValue.test(fieldValue));
        }
    );

    DataFilter.addOperatorAlias('greater than', '>');
    DataFilter.addOperatorAlias('greater than or equal', '>=');
    DataFilter.addOperatorAlias('less than', '<');
    DataFilter.addOperatorAlias('less than or equal', '<=');
    DataFilter.addOperatorAlias('equal', '==');
    DataFilter.addOperatorAlias('strict equal', '===');
};

module.exports = defineDefaultOperators;