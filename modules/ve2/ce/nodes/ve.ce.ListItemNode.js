/**
 * ContentEditable node for a list item.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.ListItemNode} Model to observe
 */
ve.ce.ListItemNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, model, ve.ce.ListItemNode.getDomElement( model ) );

	// Properties
	this.currentStyle = model.getAttribute( 'style' );

	// Events
	this.model.addListenerMethod( 'update', this, 'onUpdate' );
};

/* Static Members */

/**
 * Node rules.
 * 
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.ListItemNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': true,
	'canBeSplit': false
};

/**
 * Mapping of list item style values and DOM wrapper element types.
 * 
 * @static
 * @member
 */
ve.ce.ListItemNode.domWrapperElementTypes = {
	'item': 'li',
	'definition': 'dd',
	'term': 'dt'
};

/* Static Methods */

/**
 * Gets an appropriate DOM wrapper for the model.
 * 
 * This method is static because it is used before the node is fully constructed. Before all parent
 * constructors are called this.model may not be ready to be used.
 * 
 * @static
 * @method
 * @param {ve.dm.ListItemNode} model Model to create DOM wrapper for
 * @returns {jQuery} Selection containing DOM wrapper
 */
ve.ce.ListItemNode.getDomWrapper = function( model ) {
	var style = model.getAttribute( 'style' ),
		type = ve.ce.ListItemNode.domWrapperElementTypes[style];
	if ( type === undefined ) {
		throw 'Invalid style attribute in list item node model: ' + style;
	}
	return $( '<' + type + '></' + type + '>' );
};

/* Methods */

/**
 * Responds to model update events.
 * 
 * If the style changed since last update the DOM wrapper will be replaced with an appropriate one.
 * 
 * @method
 */
ve.ce.ListItemNode.prototype.onUpdate = function() {
	var style = this.model.getAttribute( 'style' );
	if ( style !== this.currentStyle ) {
		this.currentStyle = style;
		this.replaceDomWrapper( ve.ce.ListItemNode.getDomWrapper( this.model ) );
	}
};

/* Registration */

ve.ce.factory.register( 'listItem', ve.ce.ListItemNode );

/* Inheritance */

ve.extendClass( ve.ce.ListItemNode, ve.ce.BranchNode );
