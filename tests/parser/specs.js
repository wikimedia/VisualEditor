// Code copied from http://elegantcode.com/2011/03/07/taking-baby-steps-with-node-js-bdd-style-unit-tests-with-jasmine-node-sprinkled-with-some-should/
// and suitably adapted for our purposes

var jasmine = require('jasmine-node');

Object.keys(jasmine).forEach(function ( key ) {
	global[key] = jasmine[key];
});

var isVerbose = true;
var showColors = true;

process.argv.slice(2).forEach(function(arg){
    switch(arg) {
          case '--color': showColors = true; break;
          case '--no-color': showColors = false; break;
          case '--no-verbose': isVerbose = false; break;
      }
});

jasmine.executeSpecsInFolder(__dirname + '/specs', function(runner, log){
	process.exit(runner.results().failedCount);
}, isVerbose, showColors);
