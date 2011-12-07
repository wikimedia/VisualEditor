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

	// Properties
	this.currentLevelHash = null;

	// DOM Changes
	this.$.addClass( 'es-headingView' );

	// Events
	var _this = this;
	this.model.on( 'update', function() {
		_this.setClasses();
	} );

	// Initialization
	this.setClasses();
};

/* Methods */

es.HeadingView.prototype.setClasses = function() {
	var level = this.model.getElementAttribute( 'level' );
	if ( level !== this.currentLevelHash ) {
		this.currentLevelHash = level;
		var classes = this.$.attr( 'class' );
		this.$
			// Remove any existing level classes
			.attr( 'class', classes.replace( / ?es-headingView-level[0-9]+/, '' ) )
			// Add a new level class
			.addClass( 'es-headingView-level' + level );
	}
};

/* Registration */

es.DocumentView.splitRules.heading = {
	'self': true,
	'children': null
};

/* Inheritance */

es.extendClass( es.HeadingView, es.DocumentViewLeafNode );
