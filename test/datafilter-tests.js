"use strict";

var should = require('chai').should();

var DataFilter = require('../index.js');

describe('DataFilter', function(){
    var dataset = [
        {
            id : 1,
            type : 'article',
            data : {
                title : 'first article',
                text : 'first article of the test suite',
                author : {
                    name : 'author1',
                    age : 30
                },
                tags : ['first', 'article']
            }
        },
        {
            id : 2,
            type : 'article',
            data : {
                title : 'second article',
                text : 'second article of the test suite',
                author : {
                    name : 'author4',
                    age : 40
                },
                tags : ['second', 'article']
            }
        },
        {
            id : 3,
            type : 'article',
            data : {
                title : 'third article',
                text : 'third article of the test suite',
                author : {
                    name : 'author2',
                    age : 20
                },
                tags : ['first', 'article']
            }
        },
        {
            id : 4,
            type : 'newsletter',
            data : {
                title : 'last newsletter',
                text : 'some kind of commercial mail',
                author : {
                    name : 'author3',
                    age : 50
                },
                tags : ['newsletter', 'dying media']
            }
        }
    ];

    describe('#evaluateFieldValue()', function() {
        it('should return the exact value or reference', function() {
            var filter = new DataFilter();

            filter.evaluateFieldValue(dataset[0], 'type').should.equal('article');
            filter.evaluateFieldValue(dataset[0], 'id').should.equal(1);
            filter.evaluateFieldValue(dataset[0], 'data').should.equal(dataset[0].data);
            filter.evaluateFieldValue(dataset[0], 'data.title').should.equal('first article');
            filter.evaluateFieldValue(dataset[0], 'data.tags').should.equal(dataset[0].data.tags);
            filter.evaluateFieldValue(dataset[0], 'data.author.age').should.equal(30);
        });

        it('should be able to access properties of array and string', function() {
            var filter = new DataFilter();

            filter.evaluateFieldValue(dataset[0], 'data.title.length').should.equal(13);
            filter.evaluateFieldValue(dataset[0], 'data.tags.length').should.equal(2);
        });

        it('should\'nt break when accessing missing fields', function() {
            var filter = new DataFilter();

            should.not.exist(filter.evaluateFieldValue(dataset[0], 'data.missing'));
            should.not.exist(filter.evaluateFieldValue(dataset[0], 'missing'));
            should.not.exist(filter.evaluateFieldValue(dataset[0], 'data.really.missing'));
        });

        it('should return the element itself when no field is specified', function() {
            var filter = new DataFilter();

            filter.evaluateFieldValue(dataset[0], null).should.equal(dataset[0]);
            filter.evaluateFieldValue(dataset[0], '').should.equal(dataset[0]);
            filter.evaluateFieldValue(dataset[0]).should.equal(dataset[0]);
        });
    });

    describe('#evaluateExpression()', function(){
        it('should support equal', function(){
            var filter = new DataFilter();

            var operators = ['==', 'equal'];

            operators.forEach(function(operator) {
                filter.evaluateExpression('newsletter', operator, 'news').should.be.false;
                filter.evaluateExpression('newsletter', operator, 'newsletter').should.be.true;
                filter.evaluateExpression('newsletter', operator, 'Newsletter').should.be.false;
                filter.evaluateExpression('1', operator, '1').should.be.true;
                filter.evaluateExpression('1', operator, 1).should.be.true;
                filter.evaluateExpression('1', operator, 0).should.be.false;
            });
        });

        it('should support strict equal', function(){
            var filter = new DataFilter();

            var operators = ['===', 'strict equal'];

            operators.forEach(function(operator) {
                filter.evaluateExpression('newsletter', operator, 'news').should.be.false;
                filter.evaluateExpression('newsletter', operator, 'newsletter').should.be.true;
                filter.evaluateExpression('newsletter', operator, 'Newsletter').should.be.false;
                filter.evaluateExpression('1', operator, '1').should.be.true;
                filter.evaluateExpression('1', operator, 1).should.be.false;
                filter.evaluateExpression('1', operator, 0).should.be.false;
            });
        });

        it('should support contains', function(){
            var filter = new DataFilter();

            filter.evaluateExpression('newsletter', 'contains', 'news').should.be.true;
            filter.evaluateExpression('loveletter', 'contains', 'news').should.be.false;
        });

        it('should support array contains', function(){
            var filter = new DataFilter();

            filter.evaluateExpression(['news', 'letter'], 'array contains', 'news').should.be.true;
            filter.evaluateExpression(['newsletter'], 'array contains', 'news').should.be.false;
        });

        it('should support regexp', function(){
            var filter = new DataFilter();

            filter.evaluateExpression('newsletter', 'regexp', /News/i).should.be.true;
            filter.evaluateExpression('newsletter', 'regexp', 'news').should.be.true;
            filter.evaluateExpression('newsletter', 'regexp', 'News').should.be.false;
        });

        it('should support less than', function(){
            var filter = new DataFilter();

            var operators = ['<', 'less than'];

            operators.forEach(function(operator) {
                filter.evaluateExpression(100, operator, 101).should.be.true;
                filter.evaluateExpression(100, operator, 100).should.be.false;
                filter.evaluateExpression(100, operator, 0).should.be.false;
            });
        });

        it('should support greater than', function(){
            var filter = new DataFilter();

            var operators = ['>', 'greater than'];

            operators.forEach(function(operator) {
                filter.evaluateExpression(100, operator, 101).should.be.false;
                filter.evaluateExpression(100, operator, 100).should.be.false;
                filter.evaluateExpression(100, operator, 0).should.be.true;
            });
        });

        it('should accept array of filter values', function() {
            var filter = new DataFilter();

            filter.evaluateExpression('newsletter', 'contains', ['spam', 'news']).should.be.true;
            filter.evaluateExpression('newsletter', '==', ['news', 'letter']).should.be.false;
            filter.evaluateExpression('newsletter', '===', ['newsletter']).should.be.true;
            filter.evaluateExpression(100, '>', [1000, 90]).should.be.true;
            filter.evaluateExpression(100, '<', [100, 90]).should.be.false;
        });

        it('should accept negative operators', function() {
            var filter = new DataFilter();

            filter.evaluateExpression('newsletter', 'not contains', 'news').should.be.false;
            filter.evaluateExpression(100, 'not less than', 101).should.be.false;
            filter.evaluateExpression(100, 'not greater than', 101).should.be.true;
            filter.evaluateExpression('newsletter', 'not equal', ['spam', 'mail', 'newsletter']).should.be.false;
            filter.evaluateExpression(['news', 'letter'], 'not array contains', ['spam', 'mail', 'letter']).should.be.false;
        });

        it('should accept function as operator', function() {
            var filter = new DataFilter();

            var customOperator = function(fieldValue, filterValue) {
                return fieldValue > filterValue;
            };

            filter.evaluateExpression(100, customOperator, 10).should.be.true;
            filter.evaluateExpression(100, customOperator, 110).should.be.false;
        });
    });
/*
    describe('#addOperator()', function() {
        it('must return a boolean', function() {
            DataFilter.addOperator('customOperator', function(fieldValue, filterValue) {}).should.be.true;
        });

        it('must not allow modifying an existing operator', function() {
            DataFilter.addOperator('equal', function(fieldValue, filterValue) {}).should.be.false;
        });

        it('must not allow creating an operator matching the negation pattern', function() {
            DataFilter.addOperator('not someOtherOperator', function(fieldValue, filterValue) {}).should.be.false;
        });
    });
*/
    describe('#test()', function() {
        it('should just work and return boolean', function() {
            var filter = new DataFilter();
            filter.add('data.tags', 'array contains', 'first');

            filter.test(dataset[0]).should.be.true;
            filter.test(dataset[1]).should.be.false;
        });
    });

    describe('#match()', function() {
        it('should return the matching elements without modifying the input', function() {
            var filter = new DataFilter();
            filter.add('data.tags', 'array contains', 'article');
            filter.add('data.author.age', 'less than', 40);

            var filtered = filter.match(dataset);

            filtered.length.should.equal(2);
            dataset.length.should.equal(4);

            [1, 3].should.include(filtered[0].id);
            [1, 3].should.include(filtered[1].id);
        });

        it('should always return an array, even if empty', function() {
            var filter = new DataFilter();
            filter.add('data.tags', 'array contains', 'story');

            var filtered = filter.match(dataset);

            filtered.should.be.an('array');
            filtered.length.should.equal(0);
        });

        it('should always return an array, even if the dataset is not array', function() {
            var filter = new DataFilter();
            filter.add('data.tags', 'array contains', 'story');

            var filtered = filter.match('error');

            filtered.should.be.an('array');
            filtered.length.should.equal(0);
        });

        it('should work with as a blacklist too', function() {
            var filter = new DataFilter();
            filter.add('data.tags', 'array contains', 'article');

            var filtered = filter.match(dataset, DataFilter.BLACKLIST);

            filtered.should.be.an('array');
            filtered.length.should.equal(1);
            filtered[0].id.should.equal(4);
        });
    });
    
    describe('#first()', function() {
        it('should return only one element when several are matching the filter', function() {
            var filter = new DataFilter();
            filter.add('data.tags', 'array contains', 'article');

            var filtered = filter.first(dataset);

            filtered.should.be.an('object');
        });

        it('should return null when no element are matching the filter', function() {
            var filter = new DataFilter();
            filter.add('data.tags', 'array contains', 'story');

            var filtered = filter.first(dataset);

            should.equal(filtered, null);
        });

        it('should not break with incorrect input', function() {
            var filter = new DataFilter();
            filter.add('data.tags', 'array contains', 'story');

            var filtered = filter.first('error');

            should.equal(filtered, null);
        });

        it('should work with as a blacklist too', function() {
            var filter = new DataFilter();
            filter.add('data.tags', 'array contains', 'article');

            var filtered = filter.first(dataset, DataFilter.BLACKLIST);

            filtered.should.be.an('object');
            filtered.id.should.equal(4);
        });
    });

    describe('#clear()', function() {
        it('should remove all conditions', function() {
            var filter = new DataFilter();
            filter.add('data.tags', 'array contains', 'article');
            filter.add('data.author.age', 'less than', 40);
            filter.clear();

            var filtered = filter.match(dataset);
            filtered.should.be.an('array');
            filtered.length.should.equal(4);
        });
    });

    describe('#remove()', function() {
        it('should remove the matching filter', function() {
            var filter = new DataFilter();
            filter.add('data.tags', 'array contains', 'article');
            filter.add('data.author.age', 'less than', 30);
            filter.remove('data.author.age', 'less than', 30);

            var filtered = filter.match(dataset);

            filtered.length.should.equal(3);
        });

        it('should remove the matching filter even if only a part of the filter is specified', function() {
            var filter = new DataFilter();
            filter.add('data.tags', 'array contains', 'article');
            filter.add('data.author.age', 'less than', 30);
            filter.remove('data.author.age');
            filter.remove(null, null, 'article');

            var filtered = filter.match(dataset);

            filtered.length.should.equal(4);
        });

        it('should not fail if there are no matching filter', function() {
            var filter = new DataFilter();
            filter.add('data.tags', 'array contains', 'article');
            filter.remove('data.author.age');

            var filtered = filter.match(dataset);

            filtered.length.should.equal(3);
        });

        it('should not fail if there are not filter', function() {
            var filter = new DataFilter();
            filter.remove('data.author.age');

            var filtered = filter.match(dataset);

            filtered.length.should.equal(4);
        });
    });

    describe('#filter()', function() {
        it('should return matched elements', function() {
            var filtered = DataFilter.filter(dataset, [
                ['data.author.age', 'greater than', 20],
                ['data.tags', 'array contains', 'article']
            ]);

            filtered.should.be.an('array');
            filtered.length.should.equal(2);
            [1, 2].should.include(filtered[0].id);
            [1, 2].should.include(filtered[1].id);
        });
    });
});