"use strict";

/**
 * Class providing simple filtering for collection of objects
 * @constructor
 * @param {Array} [filters] A collection of conditions (ie: [['age', 'less than', 30], ['age', 'greater than', 20]])
 */
var DataFilter = function(filters) {
    this.filters = [];

    if(Array.isArray(filters)) {
        for(var i = 0, l = filters.length; i < l; i++) {
            this.add(filters[i][0], filters[i][1], filters[i][2]);
        }
    }
};

DataFilter.prototype.filters = null;
DataFilter.prototype.notRegexp = /^(!|not )/i;

/**
 * Add a condition to the filter
 * @param {string} field Field name or path of the value to filter on (ie : 'id', 'user.screenname', ...)
 * @param {string} operator Operator (ie: contains, equal, less than, regexp, ...)
 * @param {*} value Value
 * @returns {DataFilter}
 */
DataFilter.prototype.add = function(field, operator, value) {
    this.filters.push({ 'field' : field, 'operator' : operator, 'value' : value });

    return this;
};

/**
 * Remove any conditions matching the arguments from the filter
 * @param {string} [field=null] - Field name or path of the value (ie : 'id', 'user.screenname', ...)
 * @param {string} [operator=null] - Operator (ie: contains, equal, less than, regexp, ...)
 * @param {*} [value] Value
 * @returns {DataFilter}
 */
DataFilter.prototype.remove = function(field, operator, value) {
    var filters = [];

    for(var i = 0; i < this.filters.length; i++) {
        var filter = this.filters[i];

        var valid =
            (field === undefined || field === null || filter.field !== field) &&
            (operator === undefined || operator === null || filter.operator !== operator) &&
            (value === undefined || filter.value !== value);

        if(valid) {
            filters.push(filter);
        }
    }

    this.filters = filters;

    return this;
};

/**
 * Remove all the conditions from the filter
 * @returns {DataFilter}
 */
DataFilter.prototype.clear = function() {
    this.filters = [];

    return this;
};

/**
 * Obtain the value of an element (object or other) for the given field name or path
 * @param {*} element Element (object or other)
 * @param {string} field Field name or path of the value (ie : 'id', 'user.screenname', ...)
 * @returns {*} Field value
 */
DataFilter.prototype.evaluateFieldValue = function(element, field) {
    var fieldpath = (field === null || field === '' || field === undefined) ? [] : String(field).split('.');
    var value = element;

    for(var i = 0, l = fieldpath.length; i < l && value !== null && value !== undefined; i++) {
        value = value[fieldpath[i]];
    }

    return value;
};

/**
 * Check whether an atomic condition is true
 * @param {*} valueSource Value to test
 * @param {string} operator Operator
 * @param {*} valueFilter Value to compare with / filter on
 * @returns {boolean}
 */
DataFilter.prototype.evaluatePartialExpression = function(valueSource, operator, valueFilter) {
    var result = false;

    switch(operator) {
        case '>':
        case 'greater than':
            result = (valueSource > valueFilter);
            break;
        case '>=':
        case 'greater than equal':
            result = (valueSource >= valueFilter);
            break;
        case '<':
        case 'less than':
            result = (valueSource < valueFilter);
            break;
        case '<=':
        case 'less than equal':
            result = (valueSource <= valueFilter);
            break;
        case '==':
        case 'equal':
            result = (valueSource == valueFilter);
            break;
        case '===':
        case 'strict equal':
            result = (valueSource === valueFilter);
            break;
        case 'contains':
            result = (typeof(valueSource) === 'string' && valueSource.indexOf(valueFilter) >= 0);
            break;
        case 'array contains':
            result = (Array.isArray(valueSource) && valueSource.indexOf(valueFilter) >= 0);
            break;
        case 'regexp':
            if(typeof valueFilter === 'string') {
                valueFilter = new RegExp(valueFilter);
            }
            result = (typeof(valueFilter.test) === 'function' && valueFilter.test(valueSource));
            break;
    }

    return result;
};

/**
 * Check whether a conditions is true
 * @param {*} sourceValue Value to test
 * @param {string} operator Operator
 * @param {*} filterValues Value to compare with / filter on (may be an array of values)
 * @returns {boolean}
 */
DataFilter.prototype.evaluateExpression = function(sourceValue, operator, filterValues) {
    var result = false,
        operatorName,
        operatorPolarity;

    operator = String(operator).trim();
    filterValues = [].concat(filterValues);

    if(this.notRegexp.test(operator)) {
        operatorPolarity = false;
        operatorName = operator.replace(this.notRegexp, '');
    } else {
        operatorPolarity = true;
        operatorName = operator;
    }

    for(var i2 = 0, l2 = filterValues.length; i2 < l2; i2++) {
        result = this.evaluatePartialExpression(sourceValue, operatorName, filterValues[i2]);

        if(result) {
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
DataFilter.prototype.test = function(element) {
    var result = true;

    for(var i = 0, l = this.filters.length; i < l; i++) {
        var filter = this.filters[i];

        var sourceValue = this.evaluateFieldValue(element, filter.field);

        result = this.evaluateExpression(sourceValue, filter.operator, filter.value);

        if(!result) {
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
DataFilter.prototype.match = function(elements, polarity) {
    var filtered = [];
    var filterPolarity = !!(polarity === undefined ? DataFilter.WHITELIST : polarity);

    if(Array.isArray(elements)) {
        for(var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if(this.test(element) === filterPolarity) {
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
DataFilter.prototype.first = function(elements, polarity) {
    var first = null;
    var filterPolarity = !!(polarity === undefined ? DataFilter.WHITELIST : polarity);

    if(Array.isArray(elements)) {
        for(var i = 0; i < elements.length && first === null; i++) {
            var element = elements[i];
            if(this.test(element) === filterPolarity) {
                first = element;
            }
        }
    }

    return first;
};

/**
 * Shorthand syntax to filter a collection of objects
 * @param {Array} elements A collection of objects to filter
 * @param {Array} filters A collection of conditions (ie: [['age', 'less than', 30], ['age', 'greater than', 20]])
 * @param {boolean} [polarity=true] True for whitelisting, false for blacklisting
 * @returns {Array} Matching elements
 */
DataFilter.filter = function(elements, filters, polarity) {
    var filter = new DataFilter(filters);

    return filter.match(elements, polarity);
};

DataFilter.WHITELIST = true;
DataFilter.BLACKLIST = false;

module.exports = DataFilter;