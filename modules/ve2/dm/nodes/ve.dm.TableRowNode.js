/**
 * DataModel node for a table row.
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

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @member
 */
ve.dm.TableRowNode.rules = {
	'isWrapped': true,
	'isContent': false,
	'canContainContent': false,
	'childNodeTypes': ['tableCell'],
	'parentNodeTypes': ['table']
};

/**
 * Node converters.
 *
 * @see {ve.dm.Converter}
 * @static
 * @member
 */
ve.dm.TableRowNode.converters = {
	'domElementTypes': ['tr'],
	'toDomElement': function( type, element ) {
		return document.createElement( 'tr' );
	},
	'toDataElement': function( tag, element ) {
		return { 'type': 'tableRow' };
	}
};

/* Registration */

ve.dm.nodeFactory.register( 'tableRow', ve.dm.TableRowNode );

/* Inheritance */

ve.extendClass( ve.dm.TableRowNode, ve.dm.BranchNode );
