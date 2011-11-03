/**
 * Ordered collection of blocks.
 * 
 * @class
 * @constructor
 * @extends {es.EventEmitter}
 * @param blocks {Array} List of blocks
 * @property blocks {Array}
 * @property width {Integer}
 */
es.Document = function( blocks ) {
	es.DomContainer.call( this, 'document', 'blocks', blocks );
	this.width = null;
};

/* Static Members */

/**
 * List of registered document serializers.
 */
es.Document.serializers = {};

/* Static Methods */

/**
 * Creates new es.Document from a WikiDom Document object
 * 
 * @method
 * @param {Object} WikiDom document object
 * @returns {es.Document} EditSurface document object
 */
es.Document.newFromWikiDomDocument = function( wikidomDocument ) {
	var blocks = [];
	if ( $.isArray( wikidomDocument.blocks ) ) {
		for ( var i = 0; i < wikidomDocument.blocks.length; i++ ) {
			blocks.push( es.Block.newFromWikiDomBlock( wikidomDocument.blocks[i] ) );
		}
	}
	return new es.Document( blocks );
};

/* Methods */

es.Document.prototype.serialize = function( serializer, context, options ) {
	if ( serializer in es.Document.serializers ) {
		return es.Document.serializers[serializer]( this.getWikiDomDocument(), context, options );
	}
};

es.Document.prototype.getSerializers = function() {
	return es.Document.serializers;
};

/**
 * Forces all blocks in the document to render.
 * 
 * @method
 */
es.Document.prototype.renderBlocks = function() {
	// Bypass rendering when width has not changed
	var width = this.$.innerWidth();
	if ( this.width === width ) {
		return;
	}
	this.width = width;
	// Render blocks
	for ( var i = 0; i < this.blocks.length; i++ ) {
		this.blocks[i].renderContent();
	}
};

es.Document.prototype.getWikiDomDocument = function() {
	var wikidom = { blocks: [ ] };
	for ( var i = 0; i < this.blocks.length; i++ ) {
		wikidom.blocks.push( this.blocks[i].getWikiDom() );
	}
	return wikidom;
};

/* Inheritance */

$.extend( es, es.Document, es.DomContainer );
