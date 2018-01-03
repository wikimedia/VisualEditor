/*!
 * VisualEditor UserInterface PreviewElement class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates a ve.ui.PreviewElement object.
 *
 * @class
 * @extends OO.ui.Element
 * @mixins OO.EventEmitter
 *
 * @constructor
 * @param {ve.dm.Node} [model] Model from which to create a preview
 * @param {Object} [config] Configuration options
 */
ve.ui.PreviewElement = function VeUiPreviewElement( model, config ) {
	// Parent constructor
	ve.ui.PreviewElement.super.call( this, config );

	// Mixin constructor
	OO.EventEmitter.call( this );

	if ( model ) {
		this.setModel( model );
	}

	// Initialize
	this.$element.addClass( 've-ui-previewElement' );
};

/* Inheritance */

OO.inheritClass( ve.ui.PreviewElement, OO.ui.Element );

OO.mixinClass( ve.ui.PreviewElement, OO.EventEmitter );

/**
 * Destroy the preview node.
 */
ve.ui.PreviewElement.prototype.destroy = function () {
	if ( this.view ) {
		this.view.destroy();
		this.view = null;
	}
};

/**
 * Set the model node for the preview
 *
 * @param {ve.dm.Node} model Model from which to create a preview
 */
ve.ui.PreviewElement.prototype.setModel = function ( model ) {
	this.model = model;
	this.updatePreview();
};

/**
 * Replace the content of the body with the model DOM
 *
 * Doesn't use jQuery to avoid document switching performance bug
 *
 * @fires render
 */
ve.ui.PreviewElement.prototype.replaceWithModelDom = function () {
	var
		// FIXME: The 'true' means 'for clipboard'. This is not really true, but changing it to 'false'
		// breaks the rendering of pretty much everything that checks for 'converter.isForClipboard()',
		// e.g. nodes in MW like MWTransclusionNode and MWNumberedExternalLinkNode.
		htmlDocument = ve.dm.converter.getDomFromNode( this.model, true ),
		body = htmlDocument.body,
		element = this.$element[ 0 ];

	// Resolve attributes (in particular, expand 'href' and 'src' using the right base)
	ve.resolveAttributes(
		body,
		this.model.getDocument().getHtmlDocument(),
		ve.dm.Converter.static.computedAttributes
	);

	ve.targetLinksToNewWindow( body );

	// Move content to element
	element.innerHTML = '';
	while ( body.childNodes.length ) {
		element.appendChild(
			element.ownerDocument.adoptNode( body.childNodes[ 0 ] )
		);
	}

	// Cleanup
	this.view.destroy();
	this.view = null;

	// Event
	this.emit( 'render' );
};

/**
 * Update the preview
 */
ve.ui.PreviewElement.prototype.updatePreview = function () {
	var element = this;

	// Initial CE node
	this.view = ve.ce.nodeFactory.create( this.model.getType(), this.model );
	this.$element.append( this.view.$element );

	// When all children are rerendered, replace with dm DOM
	ve.ce.GeneratedContentNode.static.awaitGeneratedContent( this.view )
		.then( function () {
			// Verify that the element and/or the ce node weren't destroyed
			if ( element.view ) {
				element.replaceWithModelDom();
			}
		} );
};

/**
 * Check if the preview is still generating
 *
 * @return {boolean} Still generating
 */
ve.ui.PreviewElement.prototype.isGenerating = function () {
	return !!this.view;
};
