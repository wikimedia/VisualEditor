/**
 * TinyVE CE Document - ContentEditable representation of the document content
 *
 * This is a toy version of ve.ce.Document which illustrates the main concepts
 */

/**
 * ContentEditable representation of the document content
 *
 * @class
 *
 * @constructor
 * @param {tinyve.dm.Document} model Model for which this object is a view
 * @param {tinyve.ce.Surface} surface Surface the document is part of
 */
tinyve.ce.Document = function TinyVeCeDocument( model, surface ) {
	/**
	 * @property {tinyve.dm.Document} model Model for which this object is a view
	 */
	this.model = model;
	/**
	 * @property {tinyve.ce.Node} documentNode Tree of CE nodes that own DOM elements
	 */
	this.documentNode = surface.buildNode( model.documentNode );
};

/* Inheritance */

OO.initClass( tinyve.ce.Document );
