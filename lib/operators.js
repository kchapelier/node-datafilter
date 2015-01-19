var defineDefaultOperators = function (DataFilter) {
    "use strict";

    DataFilter.Operators.add(
        'greater than',
        function (fieldValue, conditionValue) {
            return (fieldValue > conditionValue);
        }
    );

    DataFilter.Operators.add(
        'greater than or equal',
        function (fieldValue, conditionValue) {
            return (fieldValue >= conditionValue);
        }
    );

    DataFilter.Operators.add(
        'less than',
        function (fieldValue, conditionValue) {
            return (fieldValue < conditionValue);
        }
    );

    DataFilter.Operators.add(
        'less than or equal',
        function (fieldValue, conditionValue) {
            return (fieldValue <= conditionValue);
        }
    );

    DataFilter.Operators.add(
        'equal',
        function (fieldValue, conditionValue) {
            /* jshint eqeqeq: false */
            return (fieldValue == conditionValue);
            /* jshint eqeqeq: true */
        }
    );

    DataFilter.Operators.add(
        'strict equal',
        function (fieldValue, conditionValue) {
            return (fieldValue === conditionValue);
        }
    );

    DataFilter.Operators.add(
        'contains',
        function (fieldValue, conditionValue) {
            return (typeof fieldValue === 'string' && fieldValue.indexOf(conditionValue) >= 0);
        }
    );

    DataFilter.Operators.add(
        'has',
        function (fieldValue, conditionValue) {
            return (Array.isArray(fieldValue) && fieldValue.indexOf(conditionValue) >= 0);
        }
    );

    DataFilter.Operators.add(
        'matches',
        function (fieldValue, conditionValue) {
            if (typeof conditionValue === 'string') {
                conditionValue = new RegExp(conditionValue);
            }

            return (typeof conditionValue.test === 'function' && conditionValue.test(fieldValue));
        }
    );

    DataFilter.Operators.add(
        'starts with',
        function (fieldValue, conditionValue) {
            fieldValue = String(fieldValue);
            conditionValue = String(conditionValue);
            return (fieldValue.indexOf(conditionValue) === 0);
        }
    );

    DataFilter.Operators.add(
        'ends with',
        function (fieldValue, conditionValue) {
            fieldValue = String(fieldValue);
            conditionValue = String(conditionValue);
            return (fieldValue.indexOf(conditionValue) === (fieldValue.length - conditionValue.length));
        }
    );

    DataFilter.Operators.alias('greater than', '>');
    DataFilter.Operators.alias('greater than or equal', '>=');
    DataFilter.Operators.alias('less than', '<');
    DataFilter.Operators.alias('less than or equal', '<=');
    DataFilter.Operators.alias('equal', '==');
    DataFilter.Operators.alias('strict equal', '===');
};

module.exports = defineDefaultOperators;
