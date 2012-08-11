/*global console */
/**
 * VisualEditor debugging methods.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Logs data to the console.
 *
 * @static
 * @method
 * @param {Mixed} [...] Data to log
 */
ve.log = window.console && console.log ?
	ve.bind( console.log, console ) : ve.log;

/**
 * Logs an object to the console.
 *
 * @static
 * @method
 * @param {Object} obj Object to log
 */
ve.dir = window.console && console.dir ?
	ve.bind( console.dir, console ) : ve.dir;
