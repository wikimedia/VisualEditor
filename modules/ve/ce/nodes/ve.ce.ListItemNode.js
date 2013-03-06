/*!
 * VisualEditor ContentEditable ListItemNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable list item node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.ListItemNode} model Model to observe
 */
ve.ce.ListItemNode = function VeCeListItemNode( model ) {
	// Parent constructor
	ve.ce.BranchNode.call( this, model, $( '<li>' ) );
};

/* Inheritance */

ve.inheritClass( ve.ce.ListItemNode, ve.ce.BranchNode );

/* Static Properties */

ve.ce.ListItemNode.static.name = 'listItem';

ve.ce.ListItemNode.static.canBeSplit = true;

/* Registration */

ve.ce.nodeFactory.register( ve.ce.ListItemNode );
