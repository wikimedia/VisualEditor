/**
 * ContentEditable node for a list.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.ListNode} Model to observe
 */
ve.ce.ListNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, model, ve.ce.ListNode.getDomElement( model ) );

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
ve.ce.ListNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': true,
	'canBeSplit': false
};

/**
 * Mapping of list style values and DOM wrapper element types.
 * 
 * @static
 * @member
 */
ve.ce.ListNode.domWrapperElementTypes = {
	'bullet': 'ul',
	'number': 'ol',
	'definition': 'dl'
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
 * @param {ve.dm.ListNode} model Model to create DOM wrapper for
 * @returns {jQuery} Selection containing DOM wrapper
 */
ve.ce.ListNode.getDomWrapper = function( model ) {
	var style = model.getAttribute( 'style' ),
		type = ve.ce.ListNode.domWrapperElementTypes[style];
	if ( type === undefined ) {
		throw 'Invalid style attribute in list node model: ' + style;
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
ve.ce.ListNode.prototype.onUpdate = function() {
	var style = this.model.getAttribute( 'style' );
	if ( style !== this.currentStyle ) {
		this.currentStyle = style;
		this.replaceDomWrapper( ve.ce.ListNode.getDomWrapper( this.model ) );
	}
};

/* Registration */

ve.ce.factory.register( 'list', ve.ce.ListNode );

/* Inheritance */

ve.extendClass( ve.ce.ListNode, ve.ce.BranchNode );
