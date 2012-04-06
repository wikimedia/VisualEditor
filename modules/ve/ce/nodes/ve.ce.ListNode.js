/**
 * Creates an ve.ce.ListNode object.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param {ve.dm.ListNode} model List model to view
 */
ve.ce.ListNode = function( model ) {
	// Inheritance
	var style = model.getElementAttribute( 'style' ),
		type = ve.ce.ListNode.domNodeTypes[style];
	ve.ce.BranchNode.call( this, model, $( '<' + type + '></' + type + '>' ) );

	// Properties
	this.currentStylesHash = null;

	// DOM Changes
	this.$.addClass( 've-ce-listNode' );

	// Events
	var _this = this;
	this.model.on( 'update', function() {
		_this.setStyle();
	} );
};

/* Static Members */

ve.ce.ListNode.domNodeTypes = {
	'bullet': 'ul',
	'number': 'ol',
	'definition': 'dl'
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

ve.ce.DocumentNode.splitRules.list = {
	'self': false,
	'children': true
};

/* Inheritance */

ve.extendClass( ve.ce.ListNode, ve.ce.BranchNode );
