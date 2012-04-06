/**
 * Creates an ve.ce.ListItemNode object.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param {ve.dm.ListItemNode} model List item model to view
 */
ve.ce.ListItemNode = function( model ) {
	// Inheritance
	var style = model.getElementAttribute( 'style' ),
		type = ve.ce.ListItemNode.domNodeTypes[style];
	ve.ce.BranchNode.call( this, model, $( '<' + type + '></' + type + '>' ) );

	// Properties
	this.currentStylesHash = null;

	// DOM Changes
	this.$.addClass( 've-ce-listItemNode' );

	// Events
	var _this = this;
	this.model.on( 'update', function() {
		_this.setStyle();
	} );
};

/* Static Members */

ve.ce.ListItemNode.domNodeTypes = {
	'item': 'li',
	'definition': 'dd',
	'term': 'dt'
};

/* Methods */

ve.ce.HeadingNode.prototype.setStyle = function() {
	var style = this.model.getElementAttribute( 'style' ),
		type = ve.ce.ListItemNode.domNodeTypes[style];
	if ( type === undefined ) {
		throw 'Invalid style attribute for heading node: ' + style;
	}
	if ( style !== this.currentStyleHash ) {
		this.currentStyleHash = style;
		this.convertDomElement( type );
	}
};

/* Registration */

ve.ce.DocumentNode.splitRules.listItem = {
	'self': true,
	'children': false
};

/* Inheritance */

ve.extendClass( ve.ce.ListItemNode, ve.ce.BranchNode );
