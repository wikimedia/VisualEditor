/*!
 * VisualEditor DataModel DocumentSlice class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel document slice.
 *
 * @constructor
 * @param {Array} data Balanced sliced data (will be deep copied internally)
 * @param {ve.Range} [range] Original context within data
 */
ve.dm.DocumentSlice = function VeDmDocumentSlice( data, range ) {
	// Properties
	this.data = ve.copyArray( data );
	this.range = range || new ve.Range( 0, data.length );
};

/* Methods */

/**
 * Get a deep copy of the sliced data.
 *
 * @method
 * @returns {Array} Document data
 */
ve.dm.DocumentSlice.prototype.getData = function () {
	return this.data.slice( this.range.start, this.range.end );
};

/**
 * Get a balanced version of the sliced data.
 *
 * @method
 * @returns {Array} Document data
 */
ve.dm.DocumentSlice.prototype.getBalancedData = function () {
	return this.data.slice( 0 );
};
