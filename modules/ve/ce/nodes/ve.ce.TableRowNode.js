/*!
 * VisualEditor ContentEditable TableRowNodw class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable table row node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.TableRowNode} model Model to observe
 */
ve.ce.TableRowNode = function VeCeTableRowNode( model ) {
	// Parent constructor
	ve.ce.BranchNode.call( this, model, $( '<tr>' ) );
};

/* Inheritance */

ve.inheritClass( ve.ce.TableRowNode, ve.ce.BranchNode );

/* Static Properties */

ve.ce.TableRowNode.static.name = 'tableRow';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.TableRowNode );
