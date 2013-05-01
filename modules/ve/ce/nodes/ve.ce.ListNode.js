/*!
 * VisualEditor ContentEditable ListNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable list node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.ListNode} model Model to observe
 */
ve.ce.ListNode = function VeCeListNode( model ) {
	// Parent constructor
	ve.ce.BranchNode.call( this, model, ve.ce.BranchNode.getDomWrapper( model, 'style' ) );

	// Events
	this.model.connect( this, { 'update': 'onUpdate' } );
};

/* Inheritance */

ve.inheritClass( ve.ce.ListNode, ve.ce.BranchNode );

/* Static Properties */

ve.ce.ListNode.static.name = 'list';

/**
 * Mapping of list style values and DOM wrapper element types.
 *
 * @static
 * @property
 */
ve.ce.ListNode.domWrapperElementTypes = {
	'bullet': 'ul',
	'number': 'ol'
};

/* Methods */

/**
 * Handle model update events.
 *
 * If the style changed since last update the DOM wrapper will be replaced with an appropriate one.
 *
 * @method
 */
ve.ce.ListNode.prototype.onUpdate = function () {
	this.updateDomWrapper( 'style' );
};

/**
 * Handle splice events.
 *
 * This is used to solve a rendering bug in Firefox.
 * @see ve.ce.BranchNode#onSplice
 *
 * @method
 */
ve.ce.ListNode.prototype.onSplice = function () {
	// Call parent implementation
	ve.ce.BranchNode.prototype.onSplice.apply( this, Array.prototype.slice.call( arguments, 0 ) );

	// There's a bug in Firefox where numbered lists aren't renumbered after in/outdenting
	// list items. Force renumbering by requesting the height, which causes a reflow
	this.$.css( 'height' );
};

/**
 * Check if a slug be placed after the node.
 *
 * @method
 * @returns {boolean} A slug can be placed after the node
 */
ve.ce.ListNode.prototype.canHaveSlugAfter = function () {
	if ( this.getParent().getType() === 'listItem' ) {
		// Nested lists should not have slugs after them
		return false;
	} else {
		// Call the parent's implementation
		return ve.ce.BranchNode.prototype.canHaveSlugAfter.call( this );
	}
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.ListNode );
