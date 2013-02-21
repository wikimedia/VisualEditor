/*!
 * VisualEditor DataModel MetaItemFactory class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel meta item factory.
 *
 * @class
 * @extends ve.Factory
 * @constructor
 */
ve.dm.MetaItemFactory = function VeDmMetaItemFactory() {
	// Parent constructor
	ve.Factory.call( this );
};

/* Inheritance */

ve.inheritClass( ve.dm.MetaItemFactory, ve.Factory );

/* Methods */

/**
 * Check if the item stores HTML attributes in the meta-linmod.
 *
 * @method
 * @param {string} type Meta item type
 * @returns {boolean} Whether the item stores HTML attributes.
 * @throws {Error} Unknown item type
 */
ve.dm.MetaItemFactory.prototype.doesItemStoreHtmlAttributes = function ( type ) {
	if ( type in this.registry ) {
		return this.registry[type].static.storeHtmlAttributes;
	}
	throw new Error( 'Unknown item type: ' + type );
};


/* Initialization */

ve.dm.metaItemFactory = new ve.dm.MetaItemFactory();
