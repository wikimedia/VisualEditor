/**
 * Data model node for a table row.
 * 
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.TableRowNode = function( children, attributes ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'tableRow', children, attributes );
};

/* Static Members */

ve.dm.TableRowNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': true,
	'childNodeTypes': ['tableCell'],
	'parentNodeTypes': ['table']
};

/* Registration */

ve.dm.factory.register( 'tableRow', ve.dm.TableRowNode );

/* Inheritance */

ve.extendClass( ve.dm.TableRowNode, ve.dm.BranchNode );
