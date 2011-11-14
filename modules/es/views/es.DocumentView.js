/**
 * Creates an es.DocumentView object.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentViewBranchNode}
 * @param {es.DocumentModel} documentModel Document model to view
 * @param {es.SurfaceView} surfaceView Surface view this view is a child of
 */
es.DocumentView = function( model, surfaceView ) {
	// Inheritance
	es.DocumentViewBranchNode.call( this, model );

	// Properties
	this.surfaceView = surfaceView;

	// DOM Changes
	this.$.addClass( 'es-documentView' );
};

/* Static Members */

/**
 * 
 * 
 */
es.DocumentView.splitRules = {};

/* Methods */

/**
 * Get the document offset of a position created from passed DOM event
 * 
 * @method
 * @param e {Event} Event to create es.Position from
 * @returns {Integer} Document offset
 */
es.DocumentView.prototype.getOffsetFromEvent = function( e ) {
	var position = es.Position.newFromEventPagePosition( e );
	return this.getOffsetFromRenderedPosition( position );
};

/* Inheritance */

es.extendClass( es.DocumentView, es.DocumentViewBranchNode );
