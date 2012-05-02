/**
 * DataModel node for a table cell.
 * 
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.TableCellNode = function( children, attributes ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'tableCell', children, attributes );
};

/* Static Members */

/**
 * Node rules.
 * 
 * @see ve.dm.NodeFactory
 * @static
 * @member
 */
ve.dm.TableCellNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': true,
	'childNodeTypes': null,
	'parentNodeTypes': ['tableRow']
};

/* Registration */

ve.dm.factory.register( 'tableCell', ve.dm.TableCellNode );

/* Inheritance */

ve.extendClass( ve.dm.TableCellNode, ve.dm.BranchNode );
