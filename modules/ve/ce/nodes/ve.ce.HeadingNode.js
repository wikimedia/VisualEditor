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
	var level = model.getElementAttribute( 'level' ),
		type = ve.ce.HeadingNode.domNodeTypes[level];
	if ( type === undefined ) {
		throw 'Invalid level attribute for heading node: ' + level;
	}
	ve.ce.LeafNode.call( this, model, $( '<' + type + '></' + type + '>' ) );

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

/* Static Members */

ve.ce.HeadingNode.domNodeTypes = {
	'1': 'h1',
	'2': 'h2',
	'3': 'h3',
	'4': 'h4',
	'5': 'h5',
	'6': 'h6'
};

/* Methods */

ve.ce.HeadingNode.prototype.setLevel = function() {
	var level = this.model.getElementAttribute( 'level' ),
		type = ve.ce.HeadingNode.domNodeTypes[level];
	if ( type === undefined ) {
		throw 'Invalid level attribute for heading node: ' + level;
	}
	if ( level !== this.currentLevelHash ) {
		this.currentLevelHash = level;
		this.convertDomElement( type );
	}
};

/* Registration */

ve.ce.DocumentNode.splitRules.heading = {
	'self': true,
	'children': null
};

/* Inheritance */

ve.extendClass( ve.ce.HeadingNode, ve.ce.LeafNode );
