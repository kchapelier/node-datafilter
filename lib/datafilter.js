"use strict";

var notRegexp = /^(!|not )/i,
    operatorList = [];

/**
 * Class providing simple filtering for collection of objects
 * @constructor
 * @param {Array} [conditions] A collection of conditions (ie: [['age', 'less than', 30], ['age', 'greater than', 20]])
 */
var DataFilter = function (conditions) {
    this.conditions = [];

    if (Array.isArray(conditions)) {
        for (var i = 0; i < conditions.length; i++) {
            this.add(conditions[i][0], conditions[i][1], conditions[i][2]);
        }
    }
};

DataFilter.prototype.conditions = null;

/**
 * Add a condition to the filter
 * @param {string} field Field name or path of the value to filter on (ie : 'id', 'user.screenname', ...)
 * @param {string} operator Operator (ie: contains, equal, less than, regexp, ...)
 * @param {*} value Value
 * @returns {DataFilter}
 */
DataFilter.prototype.add = function (field, operator, value) {
    this.conditions.push({
        field: field,
        operator: operator,
        value: value
    });

    return this;
};

/**
 * Remove from the filter any conditions matching the arguments
 * @param {string} field Field name or path of the value (ie : 'id', 'user.screenname', ...)
 * @param {string} [operator] Operator (ie: contains, equal, less than, regexp, ...)
 * @param {*} [value] Value
 * @returns {DataFilter}
 */
DataFilter.prototype.remove = function (field, operator, value) {
    var conditions = [];

    for (var i = 0; i < this.conditions.length; i++) {
        var condition = this.conditions[i];

        var toRemove =
            (condition.field === field) &&
            (operator === undefined || operator === null || condition.operator === operator) &&
            (value === undefined || condition.value === value);

        if (!toRemove) {
            conditions.push(condition);
        }
    }

    this.conditions = conditions;

    return this;
};

/**
 * Remove all the conditions from the filter
 * @returns {DataFilter}
 */
DataFilter.prototype.clear = function () {
    this.conditions = [];

    return this;
};

/**
 * Obtain the value of an element (object or other) for the given field name or path
 * @param {*} element Element (object or other)
 * @param {string} field Field name or path of the value (ie : 'id', 'user.screenname', ...)
 * @returns {*} Field value
 * @protected
 */
DataFilter.prototype.evaluateFieldValue = function (element, field) {
    var fieldpath = (field === null || field === '' || field === undefined) ? [] : String(field).split('.');
    var value = element;

    for (var i = 0; i < fieldpath.length && value !== null && value !== undefined; i++) {
        value = value[fieldpath[i]];
    }

    return value;
};

/**
 * Check whether an atomic condition is true
 * @param {*} sourceValue Value to test
 * @param {string|function} operator Operator
 * @param {*} conditionValue Value to compare with / filter on
 * @returns {boolean}
 * @protected
 */
DataFilter.prototype.evaluatePartialExpression = function (sourceValue, operator, conditionValue) {
    var result = false;

    if (typeof operator === 'function') {
        result = !!(operator(sourceValue, conditionValue));
    } else if (operatorList.hasOwnProperty(operator)) {
        result = !!(operatorList[operator](sourceValue, conditionValue));
    }

    return result;
};

/**
 * Check whether a conditions is true
 * @param {*} sourceValue Value to test
 * @param {string|function} operator Operator
 * @param {*} conditionValues Value to compare with / filter on (may be an array of values)
 * @returns {boolean}
 * @protected
 */
DataFilter.prototype.evaluateExpression = function (sourceValue, operator, conditionValues) {
    var result = false,
        operatorPolarity = true;

    if (typeof operator !== 'function') {
        operator = String(operator).trim();

        if (notRegexp.test(operator)) {
            operatorPolarity = false;
            operator = operator.replace(notRegexp, '');
        }
    }

    if (!Array.isArray(conditionValues)) {
        conditionValues = [conditionValues];
    }

    for (var i = 0; i < conditionValues.length; i++) {
        result = this.evaluatePartialExpression(sourceValue, operator, conditionValues[i]);

        if (result) {
            break;
        }
    }

    return operatorPolarity ? result : !result;
};

/**
 * Apply the conditions of the filter on a single object and returns whether the element passes all the conditions
 * @param {Object} element Object to test
 * @returns {boolean} Whether the object passes all the conditions
 */
DataFilter.prototype.test = function (element) {
    var result = true;

    for (var i = 0; i < this.conditions.length; i++) {
        var condition = this.conditions[i];

        var sourceValue = this.evaluateFieldValue(element, condition.field);

        result = this.evaluateExpression(sourceValue, condition.operator, condition.value);

        if (!result) {
            break;
        }
    }

    return result;
};

/**
 * Apply the conditions of the filter on a collection of objects and returns all the matching elements as an array
 * @param {Array} elements A collection of objects to filter
 * @param {boolean} [polarity=true] True for whitelisting, false for blacklisting
 * @returns {Array}
 */
DataFilter.prototype.match = function (elements, polarity) {
    var filtered = [];
    var filterPolarity = !!(polarity === undefined ? DataFilter.WHITELIST : polarity);

    if (Array.isArray(elements)) {
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if (this.test(element) === filterPolarity) {
                filtered.push(element);
            }
        }
    }

    return filtered;
};

/**
 * Apply the conditions of the filter on a collection of objects and returns the first matching element, if any
 * @param {Array} elements A collection of object to filter
 * @param {boolean} [polarity=true] True for whitelisting, false for blacklisting
 * @returns {Object|null}
 */
DataFilter.prototype.first = function (elements, polarity) {
    var first = null;
    var filterPolarity = !!(polarity === undefined ? DataFilter.WHITELIST : polarity);

    if (Array.isArray(elements)) {
        for (var i = 0; i < elements.length && first === null; i++) {
            var element = elements[i];
            if (this.test(element) === filterPolarity) {
                first = element;
            }
        }
    }

    return first;
};

/**
 * Shorthand syntax to filter a collection of objects
 * @param {Array} elements A collection of objects to filter
 * @param {Array} conditions A collection of conditions (ie: [['age', 'less than', 30], ['age', 'greater than', 20]])
 * @param {boolean} [polarity=true] True for whitelisting, false for blacklisting
 * @returns {Array} Matching elements
 */
DataFilter.filter = function (elements, conditions, polarity) {
    var filter = new DataFilter(conditions);

    return filter.match(elements, polarity);
};


DataFilter.Operators = {};

/**
 * Add an operator to the global operator list
 * @param {string} name Name of the operator (must not match the negation pattern or already be in use)
 * @param {function} evaluationFunction Evaluation function comparing the field value (its first argument) and
 *        the filter value (its second argument)
 * @returns {boolean} Whether the operation succeed
 */
DataFilter.Operators.add = function (name, evaluationFunction) {
    var result = false;

    name = name.trim();

    if (typeof evaluationFunction === 'function' && !notRegexp.test(name) && !operatorList.hasOwnProperty(name)) {
        operatorList[name] = evaluationFunction;
        result = true;
    }

    return result;
};

/**
 * Create an alias for an existing operator (by effectively creating a copy of the operator).
 * @param {string} name Name of the existing operator
 * @param {string} alias Name of the alias (must not match the negation pattern or already be in use)
 * @returns {boolean} Whether the operation succeed
 */
DataFilter.Operators.alias = function (name, alias) {
    var result = false;

    name = name.trim();
    alias = alias.trim();

    if (operatorList.hasOwnProperty(name) && !notRegexp.test(alias) && !operatorList.hasOwnProperty(alias)) {
        operatorList[alias] = operatorList[name];
        result = true;
    }

    return result;
};

DataFilter.WHITELIST = true;
DataFilter.BLACKLIST = false;

module.exports = DataFilter;
