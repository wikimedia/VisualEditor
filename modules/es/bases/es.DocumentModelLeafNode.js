/**
 * Creates an es.DocumentModelLeafNode object.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {es.DocumentLeafNode}
 * @extends {es.DocumentModelNode}
 * @param {String} type Symbolic name of node type
 * @param {Object} element Element object in document data
 * @param {Integer} [length] Length of content data in document
 */
es.DocumentModelLeafNode = function( type, element, length ) {
	// Inheritance
	es.DocumentLeafNode.call( this );
	es.DocumentModelNode.call( this, type, element, length );

	// Properties
	this.contentLength = length || 0;
};

/* Methods */

/**
 * Gets a plain object representation of the document's data.
 * 
 * @method
 * @see {es.DocumentModelNode.getPlainObject}
 * @see {es.DocumentModel.newFromPlainObject}
 * @returns {Object} Plain object representation, 
 */
es.DocumentModelLeafNode.prototype.getPlainObject = function() {
	var obj = { 'type': this.type };
	if ( this.element && this.element.attributes ) {
		obj.attributes = es.copyObject( this.element.attributes );
	}
	obj.content = es.DocumentModel.getExpandedContentData( this.getContentData() );
	return obj;
};

/* Inheritance */

es.extendClass( es.DocumentModelLeafNode, es.DocumentLeafNode );
es.extendClass( es.DocumentModelLeafNode, es.DocumentModelNode );
