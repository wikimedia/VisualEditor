/*!
 * VisualEditor UserInterface namespace.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Namespace for all VisualEditor UserInterface classes, static methods and static properties.
 * @class
 * @singleton
 */
ve.ui = {
	//'inspectorFactory': Initialized in ve.ui.InspectorFactory.js
	//'toolFactory': Initialized in ve.ui.ToolFactory.js
};

/**
 * Gets a jQuery function within a specific document.
 *
 * @param {jQuery|HTMLDocument} context Context to bind the function to
 * @returns {Function} Bound jQuery function
 */
ve.ui.get$$ = function ( context ) {
	return function ( selector ) {
		return $( selector, context instanceof jQuery ? context.context : context );
	};
};
