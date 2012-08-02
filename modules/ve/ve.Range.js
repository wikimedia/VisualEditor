/**
 * VisualEditor Range class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Range of content.
 *
 * @class
 * @constructor
 * @param from {Integer} Starting offset
 * @param [to=from] {Integer} Ending offset
 * @property from {Integer} Starting offset
 * @property to {Integer} Ending offset
 * @property start {Integer} Normalized starting offset
 * @property end {Integer} Normalized ending offset
 */
ve.Range = function ( from, to ) {
	this.from = from || 0;
	this.to = typeof to === 'undefined' ? this.from : to;
	this.normalize();
};

/**
 * Creates a new ve.Range object that's a translated version of another.
 *
 * @method
 * @param {ve.Range} range Range to base new range on
 * @param {Integer} distance Distance to move range by
 * @returns {ve.Range} New translated range
 */
ve.Range.newFromTranslatedRange = function ( range, distance ) {
	return new ve.Range( range.from + distance, range.to + distance );
};

/**
 * Creates a new ve.Range object that covers all of the given ranges
 *
 * @method
 * @param {Array} ranges Array of ve.Range objects (at least one)
 * @returns {ve.Range} Range that spans all of the given ranges
 */
ve.Range.newCoveringRange = function ( ranges ) {
	var minStart, maxEnd, i;
	if ( !ranges || ranges.length === 0 ) {
		throw new Error( 'newCoveringRange() requires at least one range' );
	}
	minStart = ranges[0].start;
	maxEnd = ranges[0].end;
	for ( i = 1; i < ranges.length; i++ ) {
		if ( ranges[i].start < minStart ) {
			minStart = ranges[i].start;
		}
		if ( ranges[i].end > maxEnd ) {
			maxEnd = ranges[i].end;
		}
	}
	return new ve.Range( minStart, maxEnd );
};

/* Methods */

/**
 * Gets a clone of this object.
 *
 * @method
 * @returns {ve.Range} Clone of range
 */
ve.Range.prototype.clone = function () {
	return new ve.Range( this.from, this.to );
};

/**
 * Checks if an offset is within this range.
 *
 * @method
 * @param offset {Integer} Offset to check
 * @returns {Boolean} If offset is within this range
 */
ve.Range.prototype.containsOffset = function ( offset ) {
	this.normalize();
	return offset >= this.start && offset < this.end;
};

/**
 * Gets the length of the range.
 *
 * @method
 * @returns {Integer} Length of range
 */
ve.Range.prototype.getLength = function () {
	return Math.abs( this.from - this.to );
};

/**
 * Sets start and end properties, ensuring start is always before end.
 *
 * This should always be called before using the start or end properties. Do not call this unless
 * you are about to use these properties.
 *
 * @method
 */
ve.Range.prototype.normalize = function () {
	if ( this.from < this.to ) {
		this.start = this.from;
		this.end = this.to;
	} else {
		this.start = this.to;
		this.end = this.from;
	}
};

/**
 * Swaps from and to values, effectively changing the direction.
 *
 * The range will also be normalized when this is called.
 *
 * @method
 */
ve.Range.prototype.flip = function () {
	var from = this.from;
	this.from = this.to;
	this.to = from;
	this.normalize();
};

/**
 * Determines if two Ranges are equal. Direction counts.
 *
 * @method
 * @param {ve.Range}
 * @returns {Boolean}
 */
ve.Range.prototype.equals = function ( other ) {
	return this.from === other.from && this.to === other.to;
};
