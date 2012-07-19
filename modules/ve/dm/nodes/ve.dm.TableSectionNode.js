/**
 * DataModel node for a table section.
 *
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.TableSectionNode = function( children, attributes ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'tableSection', children, attributes );
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @member
 */
ve.dm.TableSectionNode.rules = {
	'isWrapped': true,
	'isContent': false,
	'canContainContent': false,
	'childNodeTypes': ['tableRow'],
	'parentNodeTypes': ['table']
};

/**
 * Node converters.
 *
 * @see {ve.dm.Converter}
 * @static
 * @member
 */
ve.dm.TableSectionNode.converters = {
	'domElementTypes': ['thead', 'tbody', 'tfoot'],
	'toDomElement': function( type, element ) {
		return element.attributes && ( {
			'header': document.createElement( 'thead' ),
			'body': document.createElement( 'tbody' ),
			'footer': document.createElement( 'tfoot' )
		} )[element.attributes.style];
	},
	'toDataElement': function( tag, element ) {
		return ( {
			'thead': { 'type': 'tableSection', 'attributes': { 'style': 'header' } },
			'tbody': { 'type': 'tableSection', 'attributes': { 'style': 'body' } },
			'tfoot': { 'type': 'tableSection', 'attributes': { 'style': 'footer' } }
		} )[tag];
	}
};

/* Registration */

ve.dm.nodeFactory.register( 'tableSection', ve.dm.TableSectionNode );

/* Inheritance */

ve.extendClass( ve.dm.TableSectionNode, ve.dm.BranchNode );
