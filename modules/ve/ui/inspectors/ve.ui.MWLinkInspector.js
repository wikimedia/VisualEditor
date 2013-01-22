/*!
 * VisualEditor user interface LinkInspector class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

/**
 * Creates an ve.ui.LinkInspector object.
 *
 * @class
 * @extends ve.ui.LinkInspector
 * @constructor
 * @param context
 */
ve.ui.MWLinkInspector = function VeUiMWLinkInspector( context ) {
	// Parent constructor
	ve.ui.LinkInspector.call( this, context );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWLinkInspector, ve.ui.LinkInspector );

/* Static properties */

ve.ui.MWLinkInspector.static.typePattern = /^link\/MW(in|ex)ternal$/;

ve.ui.MWLinkInspector.static.inputWidget = ve.ui.MWLinkTargetInputWidget;

/* Methods */

/**
 * Gets an annotation object from a target.
 *
 * The type of link is automatically detected based on some crude heuristics.
 *
 * @method
 * @param {string} target Link target
 * @returns {ve.dm.MWInternalLinkAnnotation|ve.dm.MWExternalLinkAnnotation}
 */
ve.ui.MWLinkInspector.prototype.getAnnotationFromTarget = function ( target ) {
	var title, annotation;
	// Figure out if this is an internal or external link
	if ( ve.init.platform.getExternalLinkUrlProtocolsRegExp().test( target ) ) {
		// External link
		annotation = new ve.dm.MWExternalLinkAnnotation();
		annotation.data.href = target;
	} else {
		// Internal link
		// TODO: In the longer term we'll want to have autocompletion and existence and validity
		// checks using AJAX
		try {
			title = new mw.Title( target );
			if ( title.getNamespaceId() === 6 || title.getNamespaceId() === 14 ) {
				// File: or Category: link
				// We have to prepend a colon so this is interpreted as a link
				// rather than an image inclusion or categorization
				target = ':' + target;
			}
		} catch ( e ) { }
		annotation = new ve.dm.MWInternalLinkAnnotation();
		annotation.data.title = target;
	}
	return annotation;
};

/* Registration */

ve.ui.inspectorFactory.register( 'mwLink', ve.ui.MWLinkInspector );
