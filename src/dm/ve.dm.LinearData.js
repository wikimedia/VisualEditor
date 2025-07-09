/*!
 * VisualEditor LinearData class.
 *
 * Class containing linear data and an hash-value store.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Generic linear data storage
 *
 * @class
 * @constructor
 * @param {ve.dm.HashValueStore} store Hash-value store
 * @param {ve.dm.LinearData.Item[]} [data] Linear data
 */
ve.dm.LinearData = function VeDmLinearData( store, data ) {
	this.store = store;
	this.data = data ? ve.deepFreeze( data, true ) : [];
};

/* Inheritance */

OO.initClass( ve.dm.LinearData );

// Deprecated aliases
ve.dm.FlatLinearData = ve.dm.LinearData;
ve.dm.ElementLinearData = ve.dm.LinearData;

/**
 * @typedef {Object} Element
 * @memberof ve.dm.LinearData
 * @property {string} type The type of the element
 * @property {Object} [attributes] Optional additional attributes specific to the element type
 * @property {string} [originalDomElementsHash] Hash of the original DOM elements found by the converter
 * @property {Object} [internal] Internal attributes used by the converter
 */

/**
 * @typedef {Array} AnnotatedCharacter
 * @memberof ve.dm.LinearData
 * @property {string} 0 Character data
 * @property {string[]} 1 Annotation hashses
 */

/**
 * @typedef {ve.dm.LinearData.Element|string|ve.dm.LinearData.AnnotatedCharacter} Item
 * @memberof ve.dm.LinearData
 * A single item in the linear model data array, which can be:
 * - An element object
 * - A single character string
 * - A tuple of character and annotation hashes
 */

/* Static Methods */

/**
 * Get the type of an element
 *
 * This will return the same string for close and open elements.
 *
 * @param {ve.dm.LinearData.Element} element Element item
 * @return {string} Type of the element
 */
ve.dm.LinearData.static.getType = function ( element ) {
	return this.isCloseElementData( element ) ? element.type.slice( 1 ) : element.type;
};

/**
 * Check if data item is an element.
 *
 * This method assumes that any value that has a type property that's a string is an element object.
 *
 * Element data:
 *
 *      <heading> a </heading> <paragraph> b c <img></img> </paragraph>
 *     ^         . ^          ^           . . ^     ^     ^            .
 *
 * @param {ve.dm.LinearData.Item} item Linear data item
 * @return {boolean} Item is an element
 */
ve.dm.LinearData.static.isElementData = function ( item ) {
	// Data exists and appears to be an element
	return item !== undefined && typeof item.type === 'string';
};

/**
 * Checks if data item is an open element.
 *
 * @param {ve.dm.LinearData.Item} item Element item
 * @return {boolean} Item is an open element
 */
ve.dm.LinearData.static.isOpenElementData = function ( item ) {
	return this.isElementData( item ) && !item.type.startsWith( '/' );
};

/**
 * Checks if data item is a close element.
 *
 * @param {ve.dm.LinearData.Item} item Element item
 * @return {boolean} Item is a close element
 */
ve.dm.LinearData.static.isCloseElementData = function ( item ) {
	return this.isElementData( item ) && item.type.startsWith( '/' );
};

/* Methods */

/**
 * Gets linear data from a specified index, or all data if no index specified
 *
 * @param {number} [offset] Offset to get data from
 * @return {ve.dm.LinearData.Item|ve.dm.LinearData.Item[]} Data from index, or all data (by reference)
 */
ve.dm.LinearData.prototype.getData = function ( offset ) {
	return offset === undefined ? this.data : this.data[ offset ];
};

/**
 * Sets linear data at a specified index
 *
 * @param {number} offset Offset to set data at
 * @param {ve.dm.LinearData.Item} item Value to store
 */
ve.dm.LinearData.prototype.setData = function ( offset, item ) {
	this.data[ offset ] = typeof item === 'object' ? ve.deepFreeze( item ) : item;
};

/**
 * Modify an existing object in the linear model
 *
 * As objects in the model and immutable, this creates
 * a clone which is passed to a callback function for
 * modification, then the clone is inserted into the model.
 *
 * @param {number} offset Offset to modify data at
 * @param {Function} modify Modification function. First argument is the data element to modify.
 */
ve.dm.LinearData.prototype.modifyData = function ( offset, modify ) {
	// Unfreeze object by creating a new copy
	const newItem = ve.copy( this.getData( offset ) );
	// Modify via callback
	modify( newItem );
	// Insert into linear model, re-freezing it
	this.setData( offset, newItem );
};

/**
 * Push data to the end of the array
 *
 * @param {...ve.dm.LinearData.Item} [values] Values to store
 * @return {number} The new length of the linear data
 */
ve.dm.LinearData.prototype.push = function ( ...values ) {
	return this.data.push( ...values );
};

/**
 * Gets length of the linear data
 *
 * @return {number} Length of the linear data
 */
ve.dm.LinearData.prototype.getLength = function () {
	return this.getData().length;
};

/**
 * Gets the hash-value store
 *
 * @return {ve.dm.HashValueStore} The hash-value store
 */
ve.dm.LinearData.prototype.getStore = function () {
	return this.store;
};

/**
 * Slice linear data
 *
 * @param {number} begin Index to begin at
 * @param {number} [end] Index to end at
 * @return {ve.dm.LinearData.Item[]} One-level deep copy of sliced range
 */
ve.dm.LinearData.prototype.slice = function ( begin, end ) {
	return this.data.slice( begin, end );
};

/**
 * Slice linear data and return new LinearData object containing result
 *
 * @param {number} begin Index to begin at
 * @param {number} [end] Index to end at
 * @return {ve.dm.LinearData} LinearData object containing one-level deep copy of sliced range
 */
ve.dm.LinearData.prototype.sliceObject = function ( begin, end ) {
	return new this.constructor( this.getStore(), this.slice( begin, end ) );
};

/**
 * Splice linear data
 *
 * @param {number} index Splice from
 * @param {number} deleteCount Items to be removed
 * @param {...ve.dm.LinearData.Item} [elements] Items to be inserted
 * @return {ve.dm.LinearData.Item[]} Elements removed
 */
ve.dm.LinearData.prototype.splice = function ( index, deleteCount, ...elements ) {
	return this.data.splice( index, deleteCount, ...elements );
};

/**
 * Splice linear data and return new LinearData object containing result
 *
 * @param {number} index Splice from
 * @param {number} deleteCount Items to be removed
 * @param {...ve.dm.LinearData.Item} [elements] Items to be inserted
 * @return {ve.dm.LinearData} LinearData object containing elements removed
 */
ve.dm.LinearData.prototype.spliceObject = function ( index, deleteCount, ...elements ) {
	return new this.constructor( this.getStore(), this.splice( index, deleteCount, ...elements ) );
};

/**
 * Returns ve.batchSplice of linear data
 *
 * @see ve.batchSplice
 * @param {number} offset
 * @param {number} remove
 * @param {ve.dm.LinearData.Item[]} data
 * @return {ve.dm.LinearData.Item[]}
 */
ve.dm.LinearData.prototype.batchSplice = function ( offset, remove, data ) {
	return ve.batchSplice( this.getData(), offset, remove, data );
};

/**
 * Returns ve.batchSplice of linear data, wrapped in a LinearData object
 *
 * @see ve.batchSplice
 * @param {number} offset
 * @param {number} remove
 * @param {ve.dm.LinearData.Item[]} data
 * @return {ve.dm.LinearData}
 */
ve.dm.LinearData.prototype.batchSpliceObject = function ( offset, remove, data ) {
	return new this.constructor(
		this.getStore(),
		this.batchSplice( offset, remove, data )
	);
};

/**
 * Get a slice or copy of the provided data.
 *
 * @param {ve.Range} [range] Range of data to get, all data will be given by default
 * @param {boolean} [deep=false] Whether to return a deep copy (WARNING! This may be very slow)
 * @return {ve.dm.LinearData.Item[]} Slice or copy of data
 */
ve.dm.LinearData.prototype.getDataSlice = function ( range, deep ) {
	const length = this.getLength();
	let end,
		start = 0;
	if ( range !== undefined ) {
		start = Math.max( 0, Math.min( length, range.start ) );
		end = Math.max( 0, Math.min( length, range.end ) );
	}
	const data = this.slice( start, end );
	// Return either the slice or a deep copy of the slice
	return deep ? ve.copy( data ) : data;
};

/**
 * Clone the data, with a deep copy of the data.
 *
 * @return {ve.dm.LinearData} Clone of this object
 */
ve.dm.LinearData.prototype.clone = function () {
	return new this.constructor(
		this.getStore(),
		ve.copy( this.data )
	);
};
