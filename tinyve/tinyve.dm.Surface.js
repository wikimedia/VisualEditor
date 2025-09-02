/**
 * TinyVE DM Surface - clean representation of the document with selections
 *
 * This is a toy version of ve.dm.Surface which illustrates the main concepts
 */

/**
 * Clean representation of the document with selections
 *
 * @class
 *
 * @constructor
 * @param {tinyve.dm.Document} documentModel The document model
 */
tinyve.dm.Surface = function TinyVeDmSurface( documentModel ) {
	/**
	 * @property {tinyve.dm.Document} documentModel The document model
	 */
	this.documentModel = documentModel;

	/**
	 * @property {tinyve.Range|null} selection Model selection
	 */
	this.selection = null;
};

OO.initClass( tinyve.dm.Surface );
