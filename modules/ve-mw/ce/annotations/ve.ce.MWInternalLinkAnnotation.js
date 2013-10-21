/*!
 * VisualEditor ContentEditable MWInternalLinkAnnotation class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable MediaWiki internal link annotation.
 *
 * @class
 * @extends ve.ce.LinkAnnotation
 * @constructor
 * @param {ve.dm.MWInternalLinkAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.MWInternalLinkAnnotation = function VeCeMWInternalLinkAnnotation( model, parentNode, config ) {
	var dmRendering;
	// Parent constructor
	ve.ce.LinkAnnotation.call( this, model, parentNode, config );

	// DOM changes
	this.$.addClass( 've-ce-mwInternalLinkAnnotation' );
	this.$.attr( 'title', model.getAttribute( 'title' ) );
	// HACK get href from DM rendering
	// HACK HACK except if we already have a computed href
	// FIXME get rid of this hack, see bug 51487
	if ( !this.$.attr( 'href' ) ) {
		dmRendering = model.getDomElements()[0];
		this.$.attr( 'href', dmRendering.getAttribute( 'href' ) );
	}
	// else let the default attribute rendering happen
};

/* Inheritance */

OO.inheritClass( ve.ce.MWInternalLinkAnnotation, ve.ce.LinkAnnotation );

/* Static Properties */

ve.ce.MWInternalLinkAnnotation.static.name = 'link/mwInternal';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.MWInternalLinkAnnotation );
