/*!
 * VisualEditor annotated text content state chunk class
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Uniformly annotated chunk of text content
 *
 * @class
 *
 * @constructor
 * @param {string} text Plain text
 * @param {Node[]} tags Annotation tags in force
 * @param {string} type If this is a unicorn then 'unicorn', else 'text'
 */
ve.ce.TextStateChunk = function VeCeTextState( text, tags, type ) {
	/**
	 * @property {string} text The plain text of this chunk
	 */
	this.text = text;

	/**
	 * @property {Node[]} tags The annotation elements open at this chunk
	 */
	this.tags = tags;

	/**
	 * @property {string} type The chunk type: 'text' or 'unicorn'
	 */
	this.type = type;
};

/* Inheritance */

OO.initClass( ve.ce.TextStateChunk );

/* Static methods */

/**
 * Test whether two tags are equal as annotations.
 * TODO: Improve this test. Currently annotations are compared by tag name and
 * certain attributes, which results in a stricter test than that of
 * ve.dm.ModelRegistry#matchElement . That is, a tag pair that tests unequal
 * here might still both match the same ve.dm.Annotation object.
 *
 * @param {Node} tag1 An annotation element
 * @param {Node} tag2 Another annotation element
 * @return {boolean} True if the tags are equal as annotations
 */
ve.ce.TextStateChunk.static.isEqualTag = function ( tag1, tag2 ) {
	return tag1 === tag2 || (
		tag1.nodeName === tag2.nodeName &&
		tag1.getAttribute( 'class' ) === tag2.getAttribute( 'class' ) &&
		tag1.getAttribute( 'typeof' ) === tag2.getAttribute( 'typeof' ) &&
		tag1.getAttribute( 'property' ) === tag2.getAttribute( 'property' ) &&
		tag1.getAttribute( 'href' ) === tag2.getAttribute( 'href' )
	);
};

/* Methods */

/**
 * Test whether this chunk has the same annotations (in order) as another
 *
 * @param {ve.ce.TextStateChunk} other The other chunk
 * @return {boolean} True if the chunks have the same annotations
 */
ve.ce.TextStateChunk.prototype.isEqualTags = function ( other ) {
	var i, len;
	if ( this.tags === other.tags ) {
		return true;
	}
	if ( this.tags.length !== other.tags.length ) {
		return false;
	}
	for ( i = 0, len = this.tags.length; i < len; i++ ) {
		if ( !this.constructor.static.isEqualTag( this.tags[ i ], other.tags[ i ] ) ) {
			return false;
		}
	}
	return true;
};

/**
 * Test whether this chunk is equal to another chunk in both tags and text.
 *
 * @param {ve.ce.TextStateChunk} other The other chunk
 * @return {boolean} True if the chunks are equal
 */
ve.ce.TextStateChunk.prototype.isEqual = function ( other ) {
	return this.text === other.text && this.type === other.type && this.isEqualTags( other );
};
