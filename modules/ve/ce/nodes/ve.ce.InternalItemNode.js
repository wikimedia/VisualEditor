/*!
 * VisualEditor InternalItemNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable internal item node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.InternalItemNode} model Model to observe
 */
ve.ce.InternalItemNode = function VeCeInternalItemNode( model ) {
	// Parent constructor
	ve.ce.BranchNode.call(
		this, model, $( '<span>' )
	);

	// TODO: render nothing
	this.$.hide();
};

/* Inheritance */

ve.inheritClass( ve.ce.InternalItemNode, ve.ce.BranchNode );

/* Static Properties */

ve.ce.InternalItemNode.static.name = 'internalItem';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.InternalItemNode );
