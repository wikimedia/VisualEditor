/*!
 * VisualEditor DataModel MWMetaItem class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MW-specific meta item.
 *
 * @class
 * @abstract
 * @extends ve.dm.AlienMetaItem
 * @constructor
 * @param {Object} element Reference to element in meta-linmod
 */
ve.dm.MWMetaItem = function VeDmMWMetaItem( element ) {
	// Parent constructor
	ve.dm.AlienMetaItem.call( this, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWMetaItem, ve.dm.AlienMetaItem );

/* Static Properties */

ve.dm.MWMetaItem.static.name = 'MWmeta';

ve.dm.MWMetaItem.static.matchRdfaTypes = [ /^mw:/ ];

// toDataElement inherited from AlienMetaItem, will return regular alienMeta elements but
// that's fine. This class is only here so that <meta>/<link> tags with an mw: type are correctly
// mapped to AlienMetaItem rather than AlienNode.

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWMetaItem );
