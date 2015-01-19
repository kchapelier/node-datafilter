DataFilter
==========

[![Build Status](https://travis-ci.org/kchapelier/node-datafilter.svg)](https://travis-ci.org/kchapelier/node-datafilter)

Simple filtering for collections of objects

## Installing and testing

With [npm](http://npmjs.org) do:

```
npm install datafilter
```

To run the test suite, run the following command from the datafilter directory:

```
npm test
```

## API reference

### Default operators

* greater than (or >) : Check that the field is greater than the value
* greater than or equal (or >=) : Check that the field is greater than or equal to the value
* less than (or <) : Check that the field is lower than the value
* less than or equal (or <=) : Check that the field is lower than or equal to the value
* equal (or ==) : Check that the field is equal to the value
* strict equal (or ===) : Check that the field is strictly equal to the value
* contains : Check that the field is a string and contains the value
* has : Check that the field is an array and contains the value
* matches : Test the field against a RegExp object
* starts with : Check that the field starts with the value
* ends with : Check that the field ends with the value

### Operator negation and multiple values

* Any operator can be negated by prepending a single exclamation point or the keyword _not_ (ie: _not lower than_, _!==_, _!matches_).
* Thus _!==_ is a negation of _==_ (not a negation of _===_).
* All operators accept multiple filter values as an array. A condition is considered as valid as long as it is true for any of its values.

### dataFilter.add(field, operator, value);

Add a condition to the filter.
This method is chainable.

Options :

* field : Field name or path to test (ie: _title_ for the property title at the root of all object, _author.name_ for the property name of the property author, ...)
* operator : Any of the operator listed above or a custom function comparing the field value (its first argument) and the filter value (its second argument)
* value : Value or array of values to test / compare the field with.

Example :

```js
dataFilter.add('author.name', 'not equal', 'Proust');
dataFilter.add('theme', 'equal', ['philosophy', 'science']);
dataFilter.add('pageNumber', '>', 150);

var isLonger = function(fieldValue, filterValue) {
    return fieldValue.length > filterValue.length;
};
dataFilter.add('author.name', isLonger, 'Proust');

```

### dataFilter.clear();

Remove all the conditions previously added to the filter.
This method is chainable.

### dataFilter.remove(field [, operator [, value]]);

Remove all the conditions previously added to the filter matching the criteria.
This method is chainable.

Options :

* field : Field name or path of the conditions to remove.
* operator : Operator of the conditions to remove.
* value : Value or array of values of the conditions to remove.

### dataFilter.match(dataset [, polarity = DataFilter.WHITELIST]);

Apply the conditions of the filter on a collection of objects and returns all the matching elements as an array.

Options :

* dataset : An array of objects to filter.
* polarity : Whether to use the filter as a whitelist or as a blacklist (DataFilter.WHITELIST or DataFilter.BLACKLIST).

Examples :

```js
var filteredBooks = dataFilter.match(books);
var filteredBooks = dataFilter.match(books, DataFilter.BLACKLIST);
```

### dataFilter.first(dataset [, polarity = DataFilter.WHITELIST]);

Apply the conditions of the filter on a collection of objects and return the first matching element, if any. Return null otherwise.

Options :

* dataset : An array of objects to filter.
* polarity : Whether to use the filter as a whitelist or as a blacklist (DataFilter.WHITELIST or DataFilter.BLACKLIST).

Examples :

```js
var oneBook = dataFilter.first(books);
var oneBook = dataFilter.first(books, DataFilter.BLACKLIST);
```

### dataFilter.test(object);

Apply the conditions of the filter on a single object and returns whether the element passes all the conditions.

Options :

* object : Object to test.

### DataFilter.addOperator(operator, evaluationFunction);

Add an operator to the global operator list. Returns true in case of success, false otherwise.

Options :

* operator : Name of the operator (must not match the negation pattern or already be in use)
* evaluationFunction : Evaluation function comparing the field value (its first argument) and the filter value (its second argument)

### DataFilter.addOperatorAlias(operator, alias);

Create an alias for an existing operator. Returns true in case of success, false otherwise.

Options :

* operator : Name of the existing operator
* alias : Name of the alias (must not match the negation pattern or already be in use)

## Examples

```js
var instagramData = ...; //get data from instagram somehow

var filter = new DataFilter();

filter.add('likes.count', '>', 0).add('tags', 'has', ['videogame', 'game']);

var filtered = filter.match(instagramData);
```

Filter the posts retrieved from instagram to get only those having at least one like and tagged as _videogame_ or _game_.

```js
var instagramData = ...; //get data from instagram somehow

var filtered = DataFilter.filter(
    instagramData,
    [
        ['likes.count', '>', 0],
        ['tags', 'has', ['videogame', 'game']]
    ]
);
```

Do exactly the same thing with an alternative syntax.

```js
var instagramData = ...; //get data from instagram somehow

var filter = new DataFilter().add('tags', 'has', ['selfie']);

var selfies = filter.match(instagramData);
var relevantData = filter.match(instagramData, DataFilter.BLACKLIST);
```

Separate the data retrieved from Instagram in two arrays, one with the photos tagged as _selfie_ and one with those who are more likely to be of interest (not tagged as _selfie_).

## Examples using custom operators

There are two ways of using custom operators.

```js
DataFilter.Operators.add(
    'is longer than',
    function(fieldValue, filterValue) {
        return (fieldValue.length > filterValue.length);
    }
);

var filter = new DataFilter();
filter.add('name', 'is longer than', 'Proust');
```

Declares an operator globally, useful if you want to handle operators as strings only, store them in a database, etc.

```js
DataFilter.Operators.alias('is longer than', 'L>');

var filter = new DataFilter();
filter.add('name', 'L>', 'Proust');
```

Declares an alias for our new operator

```js
var isLonger = function(fieldValue, filterValue) {
    return (fieldValue.length > filterValue.length);
};

var filter = new DataFilter();
filter.add('name', isLonger, 'Proust');
```

Use a custom function as an operator, useful for single-use operators.

## Potential use cases

* You want to apply a filter on the data you got from an API.
* You want to store a set of filtering conditions in some kind of database. The conditions' format makes it really easy.
* DataFilter is not designed to be used as some kind of _SQL over JSON_.

## Changelog

### 1.0.3 (2015-01-19) :

- Update dev dependencies.
- Define jscs and jshint config.
- Added automatic tests on Node.js 0.11.x via Travis.

### 1.0.2 (2014-07-05) :

- Update dev dependencies.

### 1.0.1 (2014-04-21) :

- Now usable with Titanium.

### 1.0.0 (2014-03-30) :

- The operator `regexp` was renamed as `matches`.
- The operator `array contains` was renamed as `has`.
- The operators `greater than equal` and `lower than equal` were renamed as `greater than or equal` and `lower than or equal`.
- The operators `starts with` and `ends with` were implemented.
- The methods `evaluateFieldValue()`, `evaluateExpression()` and `evaludatePartialExpression()` were declared as protected.
- The static methods `addOperator()` and `addOperatorAlias()` were moved to `Operators.add()` and `Operators.alias()`.

## License

MIT
