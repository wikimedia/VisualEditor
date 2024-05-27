/*!
 * VisualEditor UserInterface PreviewElement class.
 *
 * @copyright See AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates a ve.ui.PreviewElement object.
 *
 * @class
 * @extends OO.ui.Element
 * @mixes OO.EventEmitter
 *
 * @constructor
 * @param {ve.dm.Node} [model] Model from which to create a preview
 * @param {Object} [config] Configuration options
 * @param {boolean} [config.useView=false] Use the view HTML, and don't bother generating model HTML, which
 *  is a bit slower
 */
ve.ui.PreviewElement = function VeUiPreviewElement( model, config ) {
	config = config || {};

	// Parent constructor
	ve.ui.PreviewElement.super.call( this, config );

	// Mixin constructor
	OO.EventEmitter.call( this );

	this.useView = !!config.useView;

	if ( model ) {
		this.setModel( model );
	}

	// Initialize
	this.$element.addClass( 've-ui-previewElement' );
};

/**
 * The element rendering has been updated
 *
 * @event ve.ui.PreviewElement#render
 */

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
 * Modify DOM node before appending to the preview
 *
 * @param {HTMLElement} element Element to be appended
 */
ve.ui.PreviewElement.prototype.beforeAppend = function ( element ) {
	// Remove slugs and nails. This used to be done in CSS but triggered
	// a catastrophic browser bug in Chrome (T341901)
	Array.prototype.forEach.call( element.querySelectorAll( '.ve-ce-nail, .ve-ce-branchNode-slug' ), ( el ) => {
		el.parentNode.removeChild( el );
	} );
	ve.targetLinksToNewWindow( element );
};

/**
 * Replace the content of the body with the model DOM
 *
 * Doesn't use jQuery to avoid document switching performance bug
 */
ve.ui.PreviewElement.prototype.replaceWithModelDom = function () {
	const htmlDocument = ve.dm.converter.getDomFromNode( this.model, ve.dm.Converter.static.PREVIEW_MODE ),
		body = htmlDocument.body,
		element = this.$element[ 0 ];

	// Resolve attributes (in particular, expand 'href' and 'src' using the right base)
	ve.resolveAttributes(
		body,
		this.model.getDocument().getHtmlDocument(),
		ve.dm.Converter.static.computedAttributes
	);

	this.beforeAppend( body );

	// Move content to element
	element.innerHTML = '';
	while ( body.childNodes.length ) {
		element.appendChild(
			element.ownerDocument.adoptNode( body.childNodes[ 0 ] )
		);
	}

	this.afterRender();
};

/**
 * Update the preview
 */
ve.ui.PreviewElement.prototype.updatePreview = function () {
	// Initial CE node
	this.view = ve.ce.nodeFactory.createFromModel( this.model );
	this.beforeAppend( this.view.$element[ 0 ] );
	this.$element.append( this.view.$element );
	this.view.setLive( true );

	ve.ce.GeneratedContentNode.static.awaitGeneratedContent( this.view )
		.then( () => {
			// When all children are rerendered, replace with DM DOM for a better preview.
			// Conversion should be pretty fast, but avoid this (by setting useView to true)
			// if you generating a lot of previews, e.g. in a list
			if ( !this.useView ) {
				// Verify that the PreviewElement hasn't been destroyed.
				if ( this.view ) {
					this.replaceWithModelDom();
				}
			} else {
				this.afterRender();
			}
		} );
};

/**
 * Cleanup and emit events after render
 *
 * @fires ve.ui.PreviewElement#render
 */
ve.ui.PreviewElement.prototype.afterRender = function () {
	// Cleanup
	this.view.destroy();
	this.view = null;

	// Event
	this.emit( 'render' );
};

/**
 * Check if the preview is still generating
 *
 * @return {boolean} Still generating
 */
ve.ui.PreviewElement.prototype.isGenerating = function () {
	return !!this.view;
};
