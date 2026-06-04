/*!
 * VisualEditor DataModel GeneratedContentNode class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel generated content node.
 *
 * @class
 * @abstract
 *
 * @constructor
 */
ve.dm.GeneratedContentNode = function VeDmGeneratedContentNode() {
};

/* Inheritance */

OO.initClass( ve.dm.GeneratedContentNode );

/* Events */

/**
 * @event ve.dm.GeneratedContentNode#generatedContentsError
 * @param {jQuery} $element Element containing the error message
 */

/* Static methods */

/**
 * Store HTML of DOM elements, hashed on data element
 *
 * @static
 * @param {ve.dm.LinearData.Element} dataElement Data element
 * @param {Object|string|Array} generatedContents Generated contents
 * @param {ve.dm.HashValueStore} store Hash-value store
 * @param {Object} [config] Additional data
 * @return {string} Hash of stored data
 */
ve.dm.GeneratedContentNode.static.storeGeneratedContents = function ( dataElement, generatedContents, store, config ) {
	const hash = OO.getHash( [ this.getHashObjectForRendering( dataElement ), config ] );
	return store.hash( generatedContents, hash );
};

/**
 * Fetch generated contents from store
 *
 * @static
 * @param {ve.dm.LinearData.Element} dataElement Data element
 * @param {ve.dm.HashValueStore} store Hash-value store
 * @param {Object} [config] Additional data
 * @return {Object|string|Array} Generated contents, or null if not found
 */
ve.dm.GeneratedContentNode.static.fetchGeneratedContents = function ( dataElement, store, config ) {
	const hash = OO.getHash( [ this.getHashObjectForRendering( dataElement ), config ] );
	return store.value( store.hashOfValue( null, hash ) );
};

/**
 * Get as hash object that uniquely describes the rendering
 *
 * Sub-classes can simplify this hash if certain attributes
 * don't affect the rendering.
 *
 * @static
 * @param {ve.dm.LinearData.Element} dataElement Data element
 * @return {Object} Hash object
 */
ve.dm.GeneratedContentNode.static.getHashObjectForRendering = function ( dataElement ) {
	return this.getHashObject( dataElement );
};

/* Methods */

/**
 * Get as hash object that uniquely describes the rendering
 *
 * The actual logic is in a static function as this needs
 * to be accessible from ve.dm.Converter
 *
 * @return {Object} Hash object
 */
ve.dm.GeneratedContentNode.prototype.getHashObjectForRendering = function () {
	return this.constructor.static.getHashObjectForRendering( this.element );
};

/**
 * Fetch generated contents from store
 *
 * @param {Object} [config] Additional data
 * @return {Object|string|Array} Generated contents, or null if not found
 */
ve.dm.GeneratedContentNode.prototype.fetchGeneratedContents = function ( config ) {
	return this.doc ? this.constructor.static.fetchGeneratedContents( this.element, this.doc.getStore(), config ) : null;
};
