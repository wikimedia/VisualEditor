/**
 * VisualEditor data model DocumentSlice class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Document slice.
 *
 * @class
 * @abstract
 * @constructor
 * @extends {ve.Node}
 * @param {Array} data Balanced sliced data
 * @param {ve.Range} [range] Original context within data
 */
ve.dm.DocumentSlice = function VeDmDocumentSlice( data, range ) {
	// Properties
	this.data = data;
	this.range = range || new ve.Range( 0, data.length );
};

/* Methods */

ve.dm.DocumentSlice.prototype.getData = function () {
	return this.data.slice( this.range.start, this.range.end );
};

ve.dm.DocumentSlice.prototype.getBalancedData = function () {
	return this.data.slice( 0 );
};
