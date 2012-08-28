/**
 * VisualEditor content editable ListItemNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable node for a list item.
 *
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.ListItemNode} Model to observe
 */
ve.ce.ListItemNode = function ( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, 'listItem', model, $( '<li>' ) );
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
	'canBeSplit': true
};

/* Registration */

ve.ce.nodeFactory.register( 'listItem', ve.ce.ListItemNode );

/* Inheritance */

ve.extendClass( ve.ce.ListItemNode, ve.ce.BranchNode );
