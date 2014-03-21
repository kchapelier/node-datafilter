var defineDefaultOperators = function(DataFilter) {
    "use strict";

    DataFilter.addOperator(
        'greater than',
        function(fieldValue, conditionValue) {
            return (fieldValue > conditionValue);
        }
    );

    DataFilter.addOperator(
        'greater than or equal',
        function(fieldValue, conditionValue) {
            return (fieldValue >= conditionValue);
        }
    );

    DataFilter.addOperator(
        'less than',
        function(fieldValue, conditionValue) {
            return (fieldValue < conditionValue);
        }
    );

    DataFilter.addOperator(
        'less than or equal',
        function(fieldValue, conditionValue) {
            return (fieldValue <= conditionValue);
        }
    );

    DataFilter.addOperator(
        'equal',
        function(fieldValue, conditionValue) {
            return (fieldValue == conditionValue);
        }
    );

    DataFilter.addOperator(
        'strict equal',
        function(fieldValue, conditionValue) {
            return (fieldValue === conditionValue);
        }
    );

    DataFilter.addOperator(
        'contains',
        function(fieldValue, conditionValue) {
            return (typeof(fieldValue) === 'string' && fieldValue.indexOf(conditionValue) >= 0);
        }
    );

    DataFilter.addOperator(
        'has',
        function(fieldValue, conditionValue) {
            return (Array.isArray(fieldValue) && fieldValue.indexOf(conditionValue) >= 0);
        }
    );

    DataFilter.addOperator(
        'matches',
        function(fieldValue, conditionValue) {
            if(typeof conditionValue === 'string') {
                conditionValue = new RegExp(conditionValue);
            }

            return (typeof(conditionValue.test) === 'function' && conditionValue.test(fieldValue));
        }
    );

    DataFilter.addOperator(
        'starts with',
        function(fieldValue, conditionValue) {
            fieldValue = String(fieldValue);
            conditionValue = String(conditionValue);
            return (fieldValue.indexOf(conditionValue) === 0);
        }
    );

    DataFilter.addOperator(
        'ends with',
        function(fieldValue, conditionValue) {
            fieldValue = String(fieldValue);
            conditionValue = String(conditionValue);
            return (fieldValue.indexOf(conditionValue) === (fieldValue.length - conditionValue.length));
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