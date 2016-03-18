/*!
 * VisualEditor UserInterface PreviewElement class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.PreviewElement object.
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
	OO.ui.Element.call( this, config );

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
 * @fires render
 */
ve.ui.PreviewElement.prototype.replaceWithModelDom = function () {
	var htmlDocument = ve.dm.converter.getDomFromNode( this.model, true ),
		$preview = $( htmlDocument.body );

	// Resolve attributes
	ve.resolveAttributes(
		$preview,
		this.model.getDocument().getHtmlDocument(),
		ve.dm.Converter.static.computedAttributes
	);

	// Make all links open in a new window (sync view)
	$preview.find( 'a' ).attr( 'target', '_blank' );

	// Replace content
	this.$element.empty().append( $preview.contents() );

	// Event
	this.emit( 'render' );

	// Cleanup
	this.view.destroy();
	this.view = null;
};

/**
 * Update the preview
 */
ve.ui.PreviewElement.prototype.updatePreview = function () {
	var promises = [],
		element = this;

	// Initial CE node
	this.view = ve.ce.nodeFactory.create( this.model.getType(), this.model );

	function queueNode( node ) {
		var promise;
		if ( typeof node.generateContents === 'function' ) {
			if ( node.isGenerating() ) {
				promise = $.Deferred();
				node.once( 'rerender', promise.resolve );
				promises.push( promise );
			}
		}
	}

	// Traverse children to see when they are all rerendered
	if ( this.view instanceof ve.ce.BranchNode ) {
		ve.BranchNode.static.traverse( this.view, queueNode );
	} else {
		queueNode( this.view );
	}

	// When all children are rerendered, replace with dm DOM
	$.when.apply( $, promises )
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
	return !!( this.view && this.view.isGenerating && this.view.isGenerating() );
};
