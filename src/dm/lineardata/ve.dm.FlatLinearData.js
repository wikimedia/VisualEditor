// Previously ve.dm.FlatLinearData - to be merged in a follow-up commit

/* Methods */

/**
 * Get the type of the element at a specified offset.
 *
 * @param {number} offset Data offset
 * @return {string} Type of the element
 */
ve.dm.LinearData.prototype.getType = function ( offset ) {
	return this.constructor.static.getType( this.getData( offset ) );
};

/**
 * Check if data at a given offset is an element.
 *
 * @param {number} offset Data offset
 * @return {boolean} Data at offset is an element
 */
ve.dm.LinearData.prototype.isElementData = function ( offset ) {
	return this.constructor.static.isElementData( this.getData( offset ) );
};

/**
 * Check for elements in data.
 *
 * This method assumes that any value that has a type property that's a string is an element object.
 * Elements are discovered by iterating through the entire data array (backwards).
 *
 * @return {boolean} At least one elements exists in data
 */
ve.dm.LinearData.prototype.containsElementData = function () {
	let i = this.getLength();
	while ( i-- ) {
		if ( this.isElementData( i ) ) {
			return true;
		}
	}
	return false;
};

/**
 * Checks if data at a given offset is an open element.
 *
 * @param {number} offset Data offset
 * @return {boolean} Data at offset is an open element
 */
ve.dm.LinearData.prototype.isOpenElementData = function ( offset ) {
	return this.constructor.static.isOpenElementData( this.getData( offset ) );
};

/**
 * Checks if data at a given offset is a close element.
 *
 * @param {number} offset Data offset
 * @return {boolean} Data at offset is a close element
 */
ve.dm.LinearData.prototype.isCloseElementData = function ( offset ) {
	return this.constructor.static.isCloseElementData( this.getData( offset ) );
};
