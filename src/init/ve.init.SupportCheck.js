/*!
 * VisualEditor initialization support checker.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

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
			( function () {
				'use strict';
				return !this && !!Function.prototype.bind && !!window.JSON;
			}() ) &&

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
