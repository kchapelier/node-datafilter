var DataFilter = function() {
	this.filters = [];
};

DataFilter.prototype.filters = null;

DataFilter.prototype.add = function(field, operator, value) {
	this.filters.push({ 'field' : field, 'operator' : operator, 'value' : value });
	
	return this;
};

/*
DataFilter.prototype.remove = function(field, operator, value) {
	return this;
};
*/

DataFilter.prototype.clear = function() {
	this.filters = [];
	
	return this;
};

DataFilter.prototype.evaluateFieldValue = function(element, field) {
	field = (field === null || field === '') ? [] : String(field).split('.');
	var value = element;
	
	for(var i2 = 0, l2 = field.length; i2 < l2; i2++) {
		value = value[field[i2]];
		
		if(value === null) {
			break;
		}
	}
	
	return value;
};

DataFilter.prototype.evaluateExpression = function(valueSource, operator, valueFilter) {
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
		case '!=':
		case 'not equal':
			result = (valueSource != valueFilter);
			break;
		case '!==':
		case 'not strict equal':
			result = (valueSource !== valueFilter);
			break;
		case 'contains':
			result = (String(valueSource).indexOf(valueFilter) >= 0);
			break;
		case 'not contains':
			result = (String(valueSource).indexOf(valueFilter) < 0);
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
}

DataFilter.prototype.test = function(element) {
	result = true;
	
	for(var i = 0, l = this.filters.length; i < l; i++) {
		var filter = this.filters[i];
		
		var sourceValue = this.evaluateFieldValue(element, filter.field);
		
		var filterValues = [].concat(filter.value);
		
		result = false;
		
		for(var i2 = 0, l2 = filterValues.length; i2 < l2; i2++) {
			result = this.evaluateExpression(sourceValue, filter.operator, filterValues[i2]);
			
			if(result) {
				break;
			}
		}
		
		if(!result) {
			break;
		}
	}

	return result;
};

DataFilter.prototype.match = function(elements) {
	var filtered = [];
	
	elements.forEach(function(element) {
		if(this.test(element)) {
			filtered.push(element);
		}
	}.bind(this));
	
	return filtered;
};

DataFilter.filter = function(elements, filters) {
	var filter = new DataFilter();
	
	for(var i = 0, l = filters.length; i < l; i++) {
		filter.add(filters[i][0], filters[i][1], filters[i][2]);
	}
	
	var filtered = filter.match(elements);
	
	return filtered;
};

module.exports = DataFilter;