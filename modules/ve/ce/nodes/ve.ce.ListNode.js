/**
 * VisualEditor content editable ListNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

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
	ve.ce.BranchNode.call( this, 'list', model, ve.ce.BranchNode.getDomWrapper( model, 'style' ) );

	// Events
	this.model.addListenerMethod( this, 'update', 'onUpdate' );
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
	'number': 'ol'
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
	this.updateDomWrapper( 'style' );
};

/* Registration */

ve.ce.nodeFactory.register( 'list', ve.ce.ListNode );

/* Inheritance */

ve.extendClass( ve.ce.ListNode, ve.ce.BranchNode );
