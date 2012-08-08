/**
 * VisualEditor Error class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Error.
 *
 * @class
 * @constructor
 * @param {String} message Human-readable description of the error
 * @param {String} fileName The name of the file containing the code that caused the exception
 * @param {Number} lineNumber The line number of the code that caused the exception
 */
ve.Error = function () {
	// Inheritance
	Error.apply( this, arguments );
};

/* Methods */

/**
 * Gets a human-readable description of the error, including the error type.
 *
 * @method
 * @returns {String} Error type and description
 */
ve.Error.prototype.toString = function () {
	return this.name + ': ' + this.message;
};

/* Inheritance */

ve.Error.prototype = new Error();
ve.Error.prototype.constructor = ve.Error;
ve.Error.prototype.name = 've.Error';
