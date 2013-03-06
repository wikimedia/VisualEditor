/*!
 * VisualEditor ContentEditable TableNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable table node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.TableNode} model Model to observe
 */
ve.ce.TableNode = function VeCeTableNode( model ) {
	// Parent constructor
	ve.ce.BranchNode.call(
		this, model, $( '<table border="1" cellpadding="5" cellspacing="5"></table>' )
	);
};

/* Inheritance */

ve.inheritClass( ve.ce.TableNode, ve.ce.BranchNode );

/* Static Properties */

ve.ce.TableNode.static.name = 'table';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.TableNode );
