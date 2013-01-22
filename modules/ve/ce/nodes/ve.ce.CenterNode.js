/*!
 * VisualEditor ContentEditable CenterNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable center node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.CenterNode} model Model to observe
 */
ve.ce.CenterNode = function VeCeCenterNode( model ) {
	// Parent constructor
	ve.ce.BranchNode.call( this, 'center', model, $( '<center>') );
};

/* Inheritance */

ve.inheritClass( ve.ce.CenterNode, ve.ce.BranchNode );

/* Registration */

ve.ce.nodeFactory.register( 'center', ve.ce.CenterNode );
