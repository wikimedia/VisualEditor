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
 * @param {jQuery|HTMLElement|HTMLDocument} context Context to bind the function to
 * @param {ve.ui.Frame} [frame] Frame of the document context
 * @returns {Function} Bound jQuery function
 */
ve.ui.get$$ = function ( context, frame ) {
	function wrapper( selector ) {
		return $( selector, wrapper.context );
	}
	if ( context instanceof jQuery ) {
		// jQuery - selections created "offscreen" won't have a context, so .context isn't reliable
		wrapper.context = context[0].ownerDocument;
	} else if ( context.ownerDocument ) {
		// HTMLElement
		wrapper.context = context.ownerDocument;
	} else {
		// HTMLDocument
		wrapper.context = context;
	}
	if ( !wrapper.context ) {
		throw new Error( 'Invalid context' );
	}
	if ( frame ) {
		wrapper.frame = frame;
	}
	return wrapper;
};
