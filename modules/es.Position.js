/**
 * Pixel position.
 * 
 * This can also support an optional bottom field, to represent a vertical line, such as a cursor.
 * 
 * @class
 * @constructor
 * @param left {Integer} Horizontal position
 * @param top {Integer} Vertical top position
 * @param bottom {Integer} Vertical bottom position of bottom (optional, default: top)
 * @property left {Integer} Horizontal position
 * @property top {Integer} Vertical top position
 * @property bottom {Integer} Vertical bottom position of bottom
 */
es.Position = function( left, top, bottom ) {
	this.left = left || 0;
	this.top = top || 0;
	this.bottom = bottom || this.top;
};

/* Static Methods */

/**
 * Creates position object from the page position of an element.
 * 
 * @static
 * @method
 * @param $element {jQuery} Element to get offset from
 * @returns {es.Position} Position with element data applied
 */
es.Position.newFromElementPagePosition = function( $element ) {
	var offset = $element.offset();
	return new es.Position( offset.left, offset.top );
};

/**
 * Creates position object from the layer position of an element.
 * 
 * @static
 * @method
 * @param $element {jQuery} Element to get position from
 * @returns {es.Position} Position with element data applied
 */
es.Position.newFromElementLayerPosition = function( $element ) {
	var position = $element.position();
	return new es.Position( position.left, position.top );
};

/**
 * Creates position object from the screen position data in an Event object.
 * 
 * @static
 * @method
 * @param event {Event} Event to get position data from
 * @returns {es.Position} Position with event data applied
 */
es.Position.newFromEventScreenPosition = function( event ) {
	return new es.Position( event.screenX, event.screenY );
};

/**
 * Creates position object from the page position data in an Event object.
 * 
 * @static
 * @method
 * @param event {Event} Event to get position data from
 * @returns {es.Position} Position with event data applied
 */
es.Position.newFromEventPagePosition = function( event ) {
	return new es.Position( event.pageX, event.pageY );
};

/**
 * Creates position object from the layer position data in an Event object.
 * 
 * @static
 * @method
 * @param event {Event} Event to get position data from
 * @returns {es.Position} Position with event data applied
 */
es.Position.newFromEventLayerPosition = function( event ) {
	return new es.Position( event.layerX, event.layerY );
};

/* Methods */

/**
 * Adds the values of a given position to this one.
 * 
 * @method
 * @param position {es.Position} Position to add values from
 */
es.Position.prototype.add = function( position ) {
	this.top += position.top;
	this.bottom += position.bottom;
	this.left += position.left;
};

/**
 * Subtracts the values of a given position to this one.
 * 
 * @method
 * @param position {es.Position} Position to subtract values from
 */
es.Position.prototype.subtract = function( position ) {
	this.top -= position.top;
	this.bottom -= position.bottom;
	this.left -= position.left;
};

/**
 * Checks if this position is the same as another one.
 * 
 * @method
 * @param position {es.Position} Position to compare with
 * @returns {Boolean} If positions have the same left and top values
 */
es.Position.prototype.at = function( position ) {
	return this.left === position.left && this.top === position.top;
};

/**
 * Checks if this position perpendicular with another one, sharing either a top or left value.
 * 
 * @method
 * @param position {es.Position} Position to compare with
 * @returns {Boolean} If positions share a top or a left value
 */
es.Position.prototype.perpendicularWith = function( position ) {
	return this.left === position.left || this.top === position.top;
};

/**
 * Checks if this position is level with another one, having the same top value.
 * 
 * @method
 * @param position {es.Position} Position to compare with
 * @returns {Boolean} If positions have the same top value
 */
es.Position.prototype.levelWith = function( position ) {
	return this.top === position.top;
};

/**
 * Checks if this position is plumb with another one, having the same left value.
 * 
 * @method
 * @param position {es.Position} Position to compare with
 * @returns {Boolean} If positions have the same left value
 */
es.Position.prototype.plumbWith = function( position ) {
	return this.left === position.left;
};

/**
 * Checks if this position is nearby another one.
 * 
 * Distance is measured radially.
 * 
 * @method
 * @param position {es.Position} Position to compare with
 * @param radius {Integer} Pixel distance from this position to consider "near-by"
 * @returns {Boolean} If positions are near-by each other
 */
es.Position.prototype.near = function( position, radius ) {
	return Math.sqrt(
		Math.pow( this.left - position.left, 2 ),
		Math.pow( this.top - position.top )
	) <= radius;
};

/**
 * Checks if this position is above another one.
 * 
 * This method utilizes the bottom property.
 * 
 * @method
 * @param position {es.Position} Position to compare with
 * @returns {Boolean} If this position is above the other
 */
es.Position.prototype.above = function( position ) {
	return this.bottom < position.top;
};

/**
 * Checks if this position is below another one.
 * 
 * This method utilizes the bottom property.
 * 
 * @method
 * @param position {es.Position} Position to compare with
 * @returns {Boolean} If this position is below the other
 */
es.Position.prototype.below = function( position ) {
	return this.top > position.bottom;
};

/**
 * Checks if this position is to the left of another one.
 * 
 * @method
 * @param position {es.Position} Position to compare with
 * @returns {Boolean} If this position is the left the other
 */
es.Position.prototype.leftOf = function( left ) {
	return this.left < left;
};

/**
 * Checks if this position is to the right of another one.
 * 
 * @method
 * @param position {es.Position} Position to compare with
 * @returns {Boolean} If this position is the right the other
 */
es.Position.prototype.rightOf = function( left ) {
	return this.left > left;
};
