/*!
 * VisualEditor namespace.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Namespace for all VisualEditor classes, static methods and static properties.
 *
 * @namespace ve
 */
window.ve = {};

/**
 * Get the current time, measured in milliseconds since January 1, 1970 (UTC).
 *
 * @return {number} Current time, monotonic in modern browsers (via Performance Timeline API)
 */
ve.now = function () {
	// Based on `mw.now` in MediaWiki core.
	// Optimisation: Cache and re-use the chosen implementation.
	// Optimisation: Avoid startup overhead by re-defining on first call instead of IIFE.
	const perf = window.performance;
	const navStart = perf && perf.timing && perf.timing.navigationStart;
	ve.now = navStart && perf.now ?
		function () {
			return navStart + perf.now();
		} : Date.now;

	return ve.now();
};
