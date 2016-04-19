/*!
 * VisualEditor initialization support checker.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

// jshint esversion: 3

( function () {
	/**
	 * Check whether the environment has the needed features to load VisualEditor.
	 * This considers every ES5 feature, support for contentEditable itself, those
	 * specific DOM features we use, and SVG support for the user interface. As we
	 * use this to check for feature compatibility this file must be ES3-parsable.
	 *
	 * @method VisualEditorSupportCheck
	 * @member global
	 * @return {boolean} True if the environment should support VisualEditor.
	 */
	window.VisualEditorSupportCheck = function () {
		return (
			/* ES5 */
			!!(
				// It would be much easier to do a quick inline function that asserts "use strict"
				// works, but since IE9 doesn't support strict mode (and we don't use strict mode)
				// we have to instead list all the ES5 features individually.
				Array.isArray &&
				Array.prototype.filter &&
				Array.prototype.indexOf &&
				Array.prototype.map &&
				Date.now &&
				Date.prototype.toJSON &&
				Object.create &&
				Object.keys &&
				String.prototype.trim &&
				window.JSON &&
				JSON.parse &&
				JSON.stringify &&
				Function.prototype.bind
			) &&

			/* contentEditable */
			!!( 'contentEditable' in document.createElement( 'div' ) ) &&

			/* SVG */
			!!(
				document.createElementNS &&
				document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' ).createSVGRect
			)
		);
	};
}() );
