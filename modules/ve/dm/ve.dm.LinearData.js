/*!
 * VisualEditor LinearData class.
 *
 * Class containing linear data and an index-value store.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic linear data storage
 *
 * @class
 * @constructor
 * @param {ve.dm.IndexValueStore} store Index-value store
 * @param {Array} [data] Linear data
 */
ve.dm.LinearData = function VeDmLinearData( store, data ) {
	this.store = store;
	this.data = data || [];
};

/* Methods */

/**
 * Gets linear data from a specified index, or all data if no index specified
 *
 * @method
 * @param {number} [offset] Offset to get data from
 * @returns {Object|Array} Data from index, or all data (by reference)
 */
ve.dm.LinearData.prototype.getData = function ( offset ) {
	return offset === undefined ? this.data : this.data[offset];
};

/**
 * Sets linear data at a specified index
 *
 * @method
 * @param {number} offset Offset to set data at
 * @param {Object|string} value Value to store
 */
ve.dm.LinearData.prototype.setData = function ( offset, value ) {
	this.data[offset] = value;
};

/**
 * Gets length of the linear data
 *
 * @method
 * @returns {number} Length of the linear data
 */
ve.dm.LinearData.prototype.getLength = function () {
	return this.getData().length;
};

/**
 * Gets the index-value store
 * @method
 * @returns {ve.dm.IndexValueStore} The index-value store
 */
ve.dm.LinearData.prototype.getStore = function () {
	return this.store;
};

/**
 * Slice linear data
 *
 * @method
 * @param {number} begin Index to begin at
 * @param {number} [end] Index to end at
 * @returns {Array} One-level deep copy of sliced range
 */
ve.dm.LinearData.prototype.slice = function () {
	return Array.prototype.slice.apply( this.data, arguments );
};

/**
 * Slice linear data and return new LinearData object containing result
 *
 * @method
 * @param {number} begin Index to begin at
 * @param {number} [end] Index to end at
 * @returns {ve.dm.LinearData} LinearData object containing one-level deep copy of sliced range
 */
ve.dm.LinearData.prototype.sliceObject = function () {
	return new this.constructor( this.getStore(), this.slice.apply( this, arguments ) );
};

/**
 * Splice linear data
 *
 * @method
 * @param {number} index Splice from
 * @param {number} howmany Items to be removed
 * @param {Object...} [element] Items to be inserted
 * @returns {Array} Elements removed
 */
ve.dm.LinearData.prototype.splice = function () {
	return Array.prototype.splice.apply( this.data, arguments );
};

/**
 * Splice linear data and return new LinearData object containing result
 *
 * @method
 * @param {number} index Splice from
 * @param {number} howmany Items to be removed
 * @param {Object...} [element] Items to be inserted
 * @returns {ve.dm.LinearData} LinearData object containing elements removed
 */
ve.dm.LinearData.prototype.spliceObject = function () {
	return new this.constructor( this.getStore(), this.splice.apply( this, arguments ) );
};

/**
 * Returns ve.batchSplice of linear data
 *
 * @method
 * @see ve#batchSplice
 * @param offset
 * @param remove
 * @param insert
 * @returns {Array}
 */
ve.dm.LinearData.prototype.batchSplice = function ( offset, remove, data ) {
	return ve.batchSplice( this.getData(), offset, remove, data );
};

/**
 * Returns ve.batchSplice of linear data, wrapped in a LinearData object
 *
 * @method
 * @see ve#batchSplice
 * @param offset
 * @param remove
 * @param insert
 * @returns {ve.dm.LinearData}
 */
ve.dm.LinearData.prototype.batchSpliceObject = function ( offset, remove, data ) {
	return new this.constructor(
		this.getStore(),
		this.batchSplice.call( this, offset, remove, data )
	);
};

/**
 * Get a slice or copy of the provided data.
 *
 * @method
 * @param {ve.Range} [range] Range of data to get, all data will be given by default
 * @param {boolean} [deep=false] Whether to return a deep copy (WARNING! This may be very slow)
 * @returns {Array} Slice or copy of document data
 */
ve.dm.LinearData.prototype.getDataSlice = function ( range, deep ) {
	var end, data,
		start = 0, length = this.getLength();
	if ( range !== undefined ) {
		start = Math.max( 0, Math.min( length, range.start ) );
		end = Math.max( 0, Math.min( length, range.end ) );
	}
	// IE work-around: arr.slice( 0, undefined ) returns [] while arr.slice( 0 ) behaves correctly
	data = end === undefined ? this.slice( start ) : this.slice( start, end );
	// Return either the slice or a deep copy of the slice
	return deep ? ve.copyArray( data ) : data;
};
