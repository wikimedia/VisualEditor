/**
 * VisualEditor debugging methods.
 * 
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Logs data to the console.
 *
 * This implementation does nothing, to add a real implmementation ve.debug needs to be loaded.
 *
 * @static
 * @method
 * @param {Mixed} [...] Data to log
 */
ve.log = window.console && window.console.log ?
	Function.prototype.bind.call( console.log, console ) : ve.log;

/**
 * Logs an object to the console.
 *
 * This implementation does nothing, to add a real implmementation ve.debug needs to be loaded.
 *
 * @static
 * @method
 * @param {Object} obj Object to log
 */
ve.dir = window.console && window.console.dir ?
	Function.prototype.bind.call( console.dir, console ) : ve.dir;
