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

	describe('#evaluateFieldValue', function() {
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
			
			filter.evaluateExpression('newsletter', '==', 'news').should.be.false;
			filter.evaluateExpression('newsletter', '==', 'newsletter').should.be.true;
			filter.evaluateExpression('newsletter', '==', 'Newsletter').should.be.false;
			filter.evaluateExpression('1', '==', '1').should.be.true;
			filter.evaluateExpression('1', '==', 1).should.be.true;
			filter.evaluateExpression('1', '==', 0).should.be.false;
		});
		
		it('should support strict equal', function(){
			var filter = new DataFilter();
			
			filter.evaluateExpression('newsletter', '===', 'news').should.be.false;
			filter.evaluateExpression('newsletter', '===', 'newsletter').should.be.true;
			filter.evaluateExpression('newsletter', '===', 'Newsletter').should.be.false;
			filter.evaluateExpression('1', '===', '1').should.be.true;
			filter.evaluateExpression('1', '===', 1).should.be.false;
			filter.evaluateExpression('1', '===', 0).should.be.false;
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
			
			filter.evaluateExpression(100, '<', 101).should.be.true;
			filter.evaluateExpression(100, '<', 100).should.be.false;
			filter.evaluateExpression(100, '<', 0).should.be.false;
		});
		
		it('should support greater than', function(){
			var filter = new DataFilter();
			
			filter.evaluateExpression(100, '>', 101).should.be.false;
			filter.evaluateExpression(100, '>', 100).should.be.false;
			filter.evaluateExpression(100, '>', 0).should.be.true;
		});
	});
});