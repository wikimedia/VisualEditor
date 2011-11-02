/**
 * Creates an es.HeadingView object.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentViewLeafNode}
 * @param {es.HeadingModel} model Heading model to view
 */
es.HeadingView = function( model ) {
	// Inheritance
	es.DocumentViewLeafNode.call( this, model );

	// DOM Changes
	this.$.addClass( 'es-headingView' );

	// Events
	this.on( 'update', this.setClasses );

	// Initialization
	this.setClasses();
};

/* Methods */

es.HeadingView.prototype.setClasses = function() {
	var classes = this.$.attr( 'class' ),
		level = this.model.getElementAttribute( 'level' );
	this.$
		// Remove any existing level classes
		.attr( 'class', classes.replace( /es-headingView-level[0-9]+/, '' ) )
		// Add a new level class
		.addClass( 'es-headingView-level' + level );
};

/* Inheritance */

es.extendClass( es.HeadingView, es.DocumentViewLeafNode );
