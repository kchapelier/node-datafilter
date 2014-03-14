datafilter
===============

Simple filtering for collections of objects

## Install

With [npm](http://npmjs.org) do:

```
npm install datafilter
```

## API reference

### Operator list

* greater than (or >) : Check that the field is greater than the value
* greater than equal (or >=) : Check that the field is greater than or equal to the value
* less than (or <) : Check that the field is lower than the value
* less than equal (or <=) : Check that the field is greater than or equal to the value
* equal : Check that the field is equal to the value
* strict equal (or ===) : Check that the field is strictly equal to the value
* contains : Check that the field is a string and contains the value
* array contains : Check that the field is an array and contains the value
* regexp : Test a field against a RegExp object

### Operator negation and multiple values

* Any operator can be negated by prepending a single exclamation point or the keyword _not_ (ie: _not lower than_, _!==_, _!regexp_).
* Gotcha : _!==_ is a negation of _==_, not a negation of _===_.
* All operators accepts multiple filter values as an array. A condition is considered as valid as long as it is true for any of its value.

### dataFilter.add(field, operator, value);

Add a condition to the filter.
This function is chainable.

Options :

* field : Field name or path to test (ie: _title_ for the property title at the root of all object, _author.name_ for the property name of the property author, ...)
* operator : Any of the operator listed above.
* value : Value to test / compare the field with.

Example :

```js
dataFilter.add('author.name', 'not equal', 'Proust');
dataFilter.add('theme', 'equal', ['philosophy', 'science']);
dataFilter.add('pageNumber', '>', 150);
```

### dataFilter.match(dataset, [polarity = DataFilter.WHITELIST]);

Apply the conditions of the filter on a collection of objects and returns all the matching elements as an array.

Options :

* dataset : An array of objects to filter.
* polarity : Whether to use the filter as a whitelist or as a blacklist (DataFilter.WHITELIST or DataFilter.BLACKLIST).

Examples :

```js
var filteredBooks = dataFilter.match(books);
var filteredBooks = dataFilter.match(books, DataFilter.BLACKLIST);
```

### dataFilter.first(dataset, [polarity = DataFilter.WHITELIST]);

Apply the conditions of the filter on a collection of objects and returns the first matching element, if any. Returns null otherwise.

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

### new glitch.GlitchedStream(options);

Transform stream implementation.

Options :

* probability : Probability of deviation per byte (between 0 and 1).
* deviation : Maximum value deviation per byte.
* whiteList : Array of whitelisted values, if set only bytes with those values will be modified.
* blackList : Array of blacklisted values, no byte with those values will be modified.
* deviationFunction : Replace the default deviation function of the stream, allows to write more complex filtering than whitelisting and blacklisting.

## Examples

```js
var instagramData = ...; //get data from instagram somehow

var filter = new DataFilter();

filter.add('likes.count', '>', 0).add('tags', 'array contains', ['videogame', 'game']);

var filtered = filter.match(instagramData);
```

Get only the post on instagram having at least one like and tagged as _videogame_ or _game_.

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

Separate the data retrieved from Instagram in two arrays, one with the photos tagged as _selfie_ and one with those who are more likely to be of interest (who are not tagged as _selfie_).

## Potential use case

* You want to apply a filter on the data you got from an API.
* You want to store a set of filtering conditions in some kind of database. The conditions format makes it really easy to do it.
* DataFilter is not supposed to be used as some kind of _SQL over JSON_.

## License

MIT