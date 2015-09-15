/*!
 * VisualEditor UserInterface PreviewWidget class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.PreviewWidget object.
 *
 * @class
 * @extends OO.ui.Widget
 *
 * @constructor
 * @param {ve.dm.Node} model Model from which to create a preview
 * @param {Object} [config] Configuration options
 */
ve.ui.PreviewWidget = function VeUiPreviewWidget( model, config ) {
	var promises = [],
		widget = this;

	// Parent constructor
	OO.ui.Widget.call( this, config );

	this.model = model;

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
			// Verify that the widget and/or the ce node weren't destroyed
			if ( widget.view ) {
				widget.replaceWithModelDom();
			}
		} );

	// Initialize
	this.$element.addClass( 've-ui-previewWidget' );
};

/* Inheritance */

OO.inheritClass( ve.ui.PreviewWidget, OO.ui.Widget );

/**
 * Destroy the preview node.
 */
ve.ui.PreviewWidget.prototype.destroy = function () {
	if ( this.view ) {
		this.view.destroy();
		this.view = null;
	}
};

/**
 * Replace the content of the body with the model DOM
 *
 * @fires render
 */
ve.ui.PreviewWidget.prototype.replaceWithModelDom = function () {
	var preview = ve.dm.converter.getDomFromModel( this.model.getDocument(), true ),
		$preview = $( preview.body );

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
 * Check if the preview is still generating
 *
 * @return {boolean} Still generating
 */
ve.ui.PreviewWidget.prototype.isGenerating = function () {
	return this.view && this.view.isGenerating();
};
