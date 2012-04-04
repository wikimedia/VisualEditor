/**
 * Creates an ve.ce.HeadingNode object.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param {ve.dm.HeadingNode} model Heading model to view
 */
ve.ce.HeadingNode = function( model ) {
	// Inheritance
	var level = model.getElementAttribute( 'level' );
	ve.ce.LeafNode.call( this, model, $( '<h' + level + '></h' + level + '>' ) );

	// Properties
	this.currentLevelHash = level;

	// DOM Changes
	this.$.addClass( 've-ce-headingNode' );

	// Events
	var _this = this;
	this.model.on( 'update', function() {
		_this.setLevel();
	} );
};

/* Methods */

ve.ce.HeadingNode.prototype.setLevel = function() {
	var level = this.model.getElementAttribute( 'level' );
	if ( level !== this.currentLevelHash ) {
		this.currentLevelHash = level;
		// Create new element
		var $new = $( '<h' + level + '></h' + level + '>' );
		// Copy classes
		$new.attr( 'class', this.$.attr( 'class' ) );
		// Swap elements
		this.$.replaceWith( $new );
		// Use new element from now on
		this.$ = $new;
		// Transplant content view
		this.contentView.setContainer( this.$ );
	}
};

/* Registration */

ve.ce.DocumentNode.splitRules.heading = {
	'self': true,
	'children': null
};

/* Inheritance */

ve.extendClass( ve.ce.HeadingNode, ve.ce.LeafNode );
