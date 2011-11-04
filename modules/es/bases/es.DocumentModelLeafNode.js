/**
 * Creates an es.DocumentModelLeafNode object.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {es.DocumentModelNode}
 * @extends {es.DocumentNode}
 * @param {String} type Symbolic name of node type
 * @param {Object} element Element object in document data
 * @param {Integer} [length] Length of content data in document
 */
es.DocumentModelLeafNode = function( type, element, length ) {
	// Inheritance
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
	obj.content = es.DocumentModel.getExpandedContentData( this.getContent() );
	return obj;
};

/**
 * Gets the content length.
 * 
 * FIXME: This method makes assumptions that a node with a data property is a DocumentModel, which
 * may be an issue if sub-classes of DocumentModelLeafNode other than DocumentModel have a data property
 * as well. A safer way of determining this would be helpful in preventing future bugs.
 * 
 * @method
 * @param {es.Range} [range] Range of content to get
 * @returns {Integer} Length of content
 */
es.DocumentModelLeafNode.prototype.getContent = function( range ) {
	// Find root
	var root = this.data ? this : ( this.root.data ? this.root : null );

	if ( root ) {
		return root.getContentFromNode( this, range );
	}
	return [];
};

/**
 * Gets plain text version of the content within a specific range.
 * 
 * @method
 * @param {es.Range} [range] Range of text to get
 * @returns {String} Text within given range
 */
es.DocumentModelLeafNode.prototype.getText = function( range ) {
	var content = this.getContent( range );
	// Copy characters
	var text = '';
	for ( var i = 0, length = content.length; i < length; i++ ) {
		// If not using in IE6 or IE7 (which do not support array access for strings) use this..
		// text += this.data[i][0];
		// Otherwise use this...
		text += typeof content[i] === 'string' ? content[i] : content[i][0];
	}
	return text;
};

/* Inheritance */

es.extendClass( es.DocumentModelLeafNode, es.DocumentModelNode );
