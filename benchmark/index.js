var Benchmark = require('benchmark');
var DataFilter = require('../index.js');

Benchmark.options.maxTime = 1.5;

var suite = new Benchmark.Suite();

var data = {
    users : {
        author : {
            age : 20,
            name : 'azerty'
        }
    },
    content : "some text"
};

var filter = new DataFilter();

filter.add('users.author.age', 'equal', 20);
filter.add('content', 'strict equal', 'some text');

console.log(filter.test(data));
console.log(filter.evaluateExpression('test', 'equal', ['test', 'testme']));
console.log(filter.evaluateExpression('test', 'equal', ['testyou', 'testme']));

suite/*.add('#evaluateFieldValue() at one level', function() {
    filter.evaluateFieldValue(data, 'users.author.age');
}).add('#evaluateFieldValue() at three levels', function() {
    filter.evaluateFieldValue(data, 'content');
}).add('#evaluateExpression() on positive conditions', function() {
    filter.evaluateExpression('test', 'equal', 'test');
    filter.evaluateExpression('test', 'strict equal', 'test');
}).add('#evaluateExpression() on negative conditions', function() {
    filter.evaluateExpression('test', 'not equal', 'test');
    filter.evaluateExpression('test', 'not strict equal', 'test');
}).add('#evaluateExpression() with two filter values (good last)', function() {
    filter.evaluateExpression('test', 'equal', ['testme', 'test']);
    filter.evaluateExpression('test', 'strict equal', ['testme', 'test']);
}).add('#evaluateExpression() with two filter values (good first)', function() {
    filter.evaluateExpression('test', 'equal', ['test', 'testme']);
    filter.evaluateExpression('test', 'strict equal', ['test', 'testme']);
})*/
.add('#test()', function() {
    filter.test(data);
}).on('cycle', function(event) {
    console.log(event.target.name, '|', (event.target.stats.mean * 1000) + 'ms', '|', event.target.stats.variance);
});

suite.run();