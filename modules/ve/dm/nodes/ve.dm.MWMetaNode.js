/*!
 * VisualEditor DataModel MWMetaNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MW-specific meta node.
 *
 * @class
 * @abstract
 * @extends ve.dm.MetaNode
 * @constructor
 * @param {string} name Node name
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWMetaNode = function VeDmMWMetaNode( name, length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, name, 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWMetaNode, ve.dm.MetaNode );

/* Static Properties */

ve.dm.MWMetaNode.static.name = 'MWmeta';

ve.dm.MWMetaNode.static.matchRdfaTypes = [ /^mw:/ ];

// toDataElement inherited from MetaNode, will return regular metaBlock/metaInline elements but
// that's fine. This class is only here so that <meta>/<link> tags with an mw: type are correctly
// mapped to MetaNode and aren't alienated.

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWMetaNode );
