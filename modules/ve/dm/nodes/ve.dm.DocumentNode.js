/**
 * VisualEditor data model DocumentNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel node for a document.
 *
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 */
ve.dm.DocumentNode = function ( children ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'document', children );
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @member
 */
ve.dm.DocumentNode.rules = {
	'isWrapped': false,
	'isContent': false,
	'canContainContent': false,
	'childNodeTypes': null,
	'parentNodeTypes': []
};

// This is a special node, no converter registration is required
ve.dm.DocumentNode.converters = null;

/* Registration */

ve.dm.nodeFactory.register( 'document', ve.dm.DocumentNode );

// This is a special node, no converter registration is required

/* Inheritance */

ve.extendClass( ve.dm.DocumentNode, ve.dm.BranchNode );
