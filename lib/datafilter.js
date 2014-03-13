"use strict";

var DataFilter = function() {
    this.filters = [];
};

DataFilter.prototype.filters = null;
DataFilter.prototype.notRegexp = /^(!|not )/i;

DataFilter.prototype.add = function(field, operator, value) {
    this.filters.push({ 'field' : field, 'operator' : operator, 'value' : value });

    return this;
};

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

DataFilter.prototype.clear = function() {
    this.filters = [];

    return this;
};

DataFilter.prototype.evaluateFieldValue = function(element, field) {
    field = (field === null || field === '' || field === undefined) ? [] : String(field).split('.');
    var value = element;

    for(var i = 0, l = field.length; i < l && value !== null && value !== undefined; i++) {
        value = value[field[i]];
    }

    return value;
};

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
            result = (String(valueSource).indexOf(valueFilter) >= 0);
            break;
        case 'array contains':
            result = (Array.isArray(valueSource) && valueSource.indexOf(valueFilter) >= 0);
            break;
        case 'regexp':
            if(typeof valueFilter === 'string') {
                valueFilter = new RegExp(valueFilter);
            }
            result = valueFilter.test(valueSource);
            break;
    }

    return result;
};

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

DataFilter.filter = function(elements, filters) {
    var filter = new DataFilter();

    for(var i = 0, l = filters.length; i < l; i++) {
        filter.add(filters[i][0], filters[i][1], filters[i][2]);
    }

    return filter.match(elements);
};

DataFilter.WHITELIST = true;
DataFilter.BLACKLIST = false;

module.exports = DataFilter;