DataFilter
==========

Simple filtering for collections of objects

## Installing and testing

With [npm](http://npmjs.org) do:

```
npm install datafilter
```

To run the test suite, run the following command from the datafilter directory:

```
npm run-script test
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
* array contains : Check that the field is an array and contains the value
* regexp : Test the field against a RegExp object
* starts with : Check that the field starts with the value
* ends with : Check that the field ends with the value

### Operator negation and multiple values

* Any operator can be negated by prepending a single exclamation point or the keyword _not_ (ie: _not lower than_, _!==_, _!regexp_).
* Gotcha : _!==_ is a negation of _==_, not a negation of _===_.
* All operators accepts multiple filter values as an array. A condition is considered as valid as long as it is true for any of its values.

### dataFilter.add(field, operator, value);

Add a condition to the filter.
This function is chainable.

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
This function is chainable.

### dataFilter.remove(field [, operator [, value]]);

Remove all the conditions previously added to the filter matching the criteria.
This function is chainable.

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

filter.add('likes.count', '>', 0).add('tags', 'array contains', ['videogame', 'game']);

var filtered = filter.match(instagramData);
```

Filter the posts retrieved from instagram to get only those having at least one like and tagged as _videogame_ or _game_.

```js
var instagramData = ...; //get data from instagram somehow

var filtered = DataFilter.filter(
    instagramData,
    [
        ['likes.count', '>', 0],
        ['tags', 'array contains', ['videogame', 'game']]
    ]
);
```

Do exactly the same thing with an alternative syntax.

```js
var instagramData = ...; //get data from instagram somehow

var filter = new DataFilter().add('tags', 'array contains', ['selfie']);

var selfies = filter.match(instagramData);
var relevantData = filter.match(instagramData, DataFilter.BLACKLIST);
```

Separate the data retrieved from Instagram in two arrays, one with the photos tagged as _selfie_ and one with those who are more likely to be of interest (not tagged as _selfie_).

## Examples using custom operators

There are two ways of using custom operators.

```js
DataFilter.addOperator(
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

## Roadmap

* Next release : 1.0.0 (fix any issue with the public API, decide whether there is a need for exception/error anywhere, document all of it and declare it stable, no new functionality).

## License

MIT