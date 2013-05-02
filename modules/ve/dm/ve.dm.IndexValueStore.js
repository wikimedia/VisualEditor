/*!
 * VisualEditor IndexValueStore class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Index-value store
 *
 * @class
 * @constructor
 */
ve.dm.IndexValueStore = function VeDmIndexValueStore() {
	// maps hashes to indexes
	this.hashStore = {};
	// maps indexes to values
	this.valueStore = [];
};

/* Methods */

/**
 * Get the index of a value in the store.
 *
 * If the hash is not found the value is added to the store.
 *
 * @method
 * @param {Object|String|Array} value Value to lookup or store
 * @param {String} [hash] Value hash. Uses ve.getHash( value ) if not provided.
 * @returns {number} The index of the value in the store
 */
ve.dm.IndexValueStore.prototype.index = function ( value, hash ) {
	var index;
	if ( typeof hash !== 'string' ) {
		hash = ve.getHash( value );
	}
	index = this.indexOfHash( hash );
	if ( index === null ) {
		if ( ve.isArray( value ) ) {
			index = this.valueStore.push( ve.copyArray( value ) ) - 1;
		} else if ( typeof value === 'object' ) {
			index = this.valueStore.push( ve.cloneObject( value ) ) - 1;
		} else {
			index = this.valueStore.push( value ) - 1;
		}
		this.hashStore[hash] = index;
	}
	return index;
};

/**
 * Get the index of a hash in the store.
 *
 * Returns null if the hash is not found.
 *
 * @method
 * @param {Object|String|Array} hash Value hash.
 * @returns {number|null} The index of the value in the store, or undefined if it is not found
 */
ve.dm.IndexValueStore.prototype.indexOfHash = function ( hash ) {
	return hash in this.hashStore ? this.hashStore[hash] : null;
};

/**
 * Get the indexes of values in the store
 *
 * Sames as index but with arrays.
 *
 * @method
 * @param {Object[]} values Values to lookup or store
 * @returns {Array} The indexes of the values in the store
 */
ve.dm.IndexValueStore.prototype.indexes = function ( values ) {
	var i, length, indexes = [];
	for ( i = 0, length = values.length; i < length; i++ ) {
		indexes.push( this.index( values[i] ) );
	}
	return indexes;
};

/**
 * Get the value at a particular index
 *
 * @method
 * @param {number} index Index to lookup
 * @returns {Object|undefined} Value at this index, or undefined if out of bounds
 */
ve.dm.IndexValueStore.prototype.value = function ( index ) {
	return this.valueStore[index];
};

/**
 * Get the values at a set of indexes
 *
 * Same as value but with arrays.
 *
 * @method
 * @param {number[]} index Index to lookup
 * @returns {Array} Values at these indexes, or undefined if out of bounds
 */
ve.dm.IndexValueStore.prototype.values = function ( indexes ) {
	var i, length, values = [];
	for ( i = 0, length = indexes.length; i < length; i++ ) {
		values.push( this.value( indexes[i] ) );
	}
	return values;
};
