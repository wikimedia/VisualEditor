/**
 * DataModel node for a heading.
 *
 * @class
 * @constructor
 * @extends {ve.dm.BranchNode}
 * @param {ve.dm.LeafNode[]} [children] Child nodes to attach
 * @param {Object} [attributes] Reference to map of attribute key/value pairs
 */
ve.dm.HeadingNode = function( children, attributes ) {
	// Inheritance
	ve.dm.BranchNode.call( this, 'heading', children, attributes );
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.dm.NodeFactory
 * @static
 * @member
 */
ve.dm.HeadingNode.rules = {
	'isWrapped': true,
	'isContent': false,
	'canContainContent': true,
	'childNodeTypes': null,
	'parentNodeTypes': null
};

/**
 * Node converters.
 *
 * @see {ve.dm.Converter}
 * @static
 * @member
 */
ve.dm.HeadingNode.converters = {
	'domElementTypes': ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
	'toDomElement': function( type, element ) {
		return element.attributes && ( {
			1: ve.dm.createDomElement( 'h1' ),
			2: ve.dm.createDomElement( 'h2' ),
			3: ve.dm.createDomElement( 'h3' ),
			4: ve.dm.createDomElement( 'h4' ),
			5: ve.dm.createDomElement( 'h5' ),
			6: ve.dm.createDomElement( 'h6' )
		} )[element.attributes['level']];
	},
	'toDataElement': function( tag, element ) {
		return ( {
			'h1': { 'type': 'heading', 'attributes': { 'level': 1 } },
			'h2': { 'type': 'heading', 'attributes': { 'level': 2 } },
			'h3': { 'type': 'heading', 'attributes': { 'level': 3 } },
			'h4': { 'type': 'heading', 'attributes': { 'level': 4 } },
			'h5': { 'type': 'heading', 'attributes': { 'level': 5 } },
			'h6': { 'type': 'heading', 'attributes': { 'level': 6 } }
		} )[tag];
	}
};

/* Registration */

ve.dm.nodeFactory.register( 'heading', ve.dm.HeadingNode );

/* Inheritance */

ve.extendClass( ve.dm.HeadingNode, ve.dm.BranchNode );
