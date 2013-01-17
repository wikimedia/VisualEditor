/*!
 * VisualEditor ContentEditable Document class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable document.
 *
 * @class
 * @extends ve.Document
 * @constructor
 * @param {ve.dm.Document} model Model to observe
 */
ve.ce.Document = function VeCeDocument( model, surface ) {
	// Parent constructor
	ve.Document.call( this, new ve.ce.DocumentNode( model.getDocumentNode(), surface ) );

	// Properties
	this.model = model;
};

/* Inheritance */

ve.inheritClass( ve.ce.Document, ve.Document );

/* Methods */

/**
 * Get a node a an offset.
 *
 * @method
 * @param {number} offset Offset to get node at
 * @returns {ve.ce.Node} Node at offset
 */
ve.ce.Document.prototype.getNodeFromOffset = function ( offset ) {
	var node = this.documentNode.getNodeFromOffset( offset );
	if ( node && !node.canHaveChildren() ) {
		node = node.getParent();
	}
	return node;
};

/**
 * Get a slug a an offset.
 *
 * @method
 * @param {number} offset Offset to get slug at
 * @returns {jQuery} Slug at offset
 */
ve.ce.Document.prototype.getSlugAtOffset = function ( offset ) {
	var node = this.getNodeFromOffset( offset );
	return node ? node.getSlugAtOffset( offset ) : null;
};
