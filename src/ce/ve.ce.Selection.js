/*!
 * VisualEditor Selection class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * @class
 * @abstract
 * @constructor
 * @param {ve.dm.Selection} model Selection model
 * @param {ve.ce.Surface} surface Surface view
 */
ve.ce.Selection = function VeCeSelection( model, surface ) {
	this.model = model;
	this.surface = surface;
};

/* Inheritance */

OO.initClass( ve.ce.Selection );

/* Static Properties */

ve.ce.Selection.static.type = null;

/* Static methods */

/**
 * Create a new selection view from a selection model
 *
 * @param {ve.dm.Selection} model Selection model
 * @param {ve.ce.Surface} surface Surface view
 * @return {ve.ce.Selection} Selection view
 */
ve.ce.Selection.static.newFromModel = function ( model, surface ) {
	return ve.ce.selectionFactory.create( model.getName(), model, surface );
};

/* Method */

/**
 * Get the surface view this selection exists on
 *
 * @return {ve.ce.Surface} Surface view
 */
ve.ce.Selection.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Get the selection model
 *
 * @return {ve.dm.Selection} Selection model
 */
ve.ce.Selection.prototype.getModel = function () {
	return this.model;
};

/**
 * Get the rectangles of the selection relative to the surface.
 *
 * @abstract
 * @return {Object[]|null} Selection rectangles
 */
ve.ce.Selection.prototype.getSelectionRects = null;

/**
 * Get the start and end rectangles of the selection relative to the surface.
 *
 * @abstract
 * @return {Object|null} Start and end selection rectangles
 */
ve.ce.Selection.prototype.getSelectionStartAndEndRects = function () {
	return ve.getStartAndEndRects( this.getSelectionRects() );
};

/**
 * Get the coordinates of the selection's bounding rectangle relative to the surface.
 *
 * @abstract
 * @return {Object|null} Selection rectangle, with keys top, bottom, left, right, width, height
 */
ve.ce.Selection.prototype.getSelectionBoundingRect = null;

/**
 * Check if the selection covers a focused node
 *
 * @abstract
 * @return {boolean} The selection covers a focused node
 */
ve.ce.Selection.prototype.isFocusedNode = null;

/**
 * Check if the selection is a native cursor selection
 *
 * @abstract
 * @return {boolean} The selection covers a focused node
 */
ve.ce.Selection.prototype.isNativeCursor = null;

/* Factory */

ve.ce.selectionFactory = new OO.Factory();
