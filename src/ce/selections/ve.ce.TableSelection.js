/*!
 * VisualEditor Table Selection class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * @class
 * @extends ve.ce.Selection
 * @constructor
 * @param {ve.ce.Surface} surface
 * @param {ve.dm.Selection} model
 */
ve.ce.TableSelection = function VeCeTableSelection() {
	// Parent constructor
	ve.ce.TableSelection.super.apply( this, arguments );

	this.direction = null;
};

/* Inheritance */

OO.inheritClass( ve.ce.TableSelection, ve.ce.Selection );

/* Static Properties */

ve.ce.TableSelection.static.name = 'table';

/* Method */

/**
 * @inheritdoc
 */
ve.ce.TableSelection.prototype.getSelectionRects = function () {
	return [ this.getSelectionBoundingRect() ];
};

/**
 * @inheritdoc
 */
ve.ce.TableSelection.prototype.getSelectionBoundingRect = function () {
	var i, l, cellOffset, top, bottom, left, right, boundingRect,
		surface = this.getSurface(),
		tableNode = surface.getDocument().getBranchNodeFromOffset( this.model.tableRange.start + 1 ),
		nodes = tableNode.getCellNodesFromSelection( this.getModel() ),
		surfaceRect = surface.getSurface().getBoundingClientRect();

	top = Infinity;
	bottom = -Infinity;
	left = Infinity;
	right = -Infinity;

	// Compute a bounding box for the given cell elements
	for ( i = 0, l = nodes.length; i < l; i++ ) {
		cellOffset = nodes[ i ].$element[ 0 ].getBoundingClientRect();

		top = Math.min( top, cellOffset.top );
		bottom = Math.max( bottom, cellOffset.bottom );
		left = Math.min( left, cellOffset.left );
		right = Math.max( right, cellOffset.right );
	}

	boundingRect = {
		top: top,
		bottom: bottom,
		left: left,
		right: right,
		width: right - left,
		height: bottom - top
	};

	if ( !boundingRect || !surfaceRect ) {
		return null;
	}
	return ve.translateRect( boundingRect, -surfaceRect.left, -surfaceRect.top );
};

/**
 * Get the bounding rectangle of the parent table
 *
 * @return {Object|null} Selection rectangle, with keys top, bottom, left, right, width, height
 */
ve.ce.TableSelection.prototype.getTableBoundingRect = function () {
	var boundingRect,
		surface = this.getSurface(),
		tableNode = surface.getDocument().getBranchNodeFromOffset( this.model.tableRange.start + 1 ),
		surfaceRect = surface.getSurface().getBoundingClientRect();

	if ( !tableNode ) {
		return null;
	}

	boundingRect = tableNode.$element[ 0 ].getBoundingClientRect();

	if ( !boundingRect || !surfaceRect ) {
		return null;
	}
	return ve.translateRect( boundingRect, -surfaceRect.left, -surfaceRect.top );
};

/**
 * @inheritdoc
 */
ve.ce.TableSelection.prototype.isFocusedNode = function () {
	return true;
};

/**
 * @inheritdoc
 */
ve.ce.TableSelection.prototype.isNativeCursor = function () {
	return false;
};

/**
 * @inheritdoc
 */
ve.ce.TableSelection.prototype.getDirection = function () {
	if ( !this.direction ) {
		this.direction = this.getSurface().getDocument().getDirectionFromRange( this.getModel().tableRange );
	}
	return this.direction;
};

/* Registration */

ve.ce.selectionFactory.register( ve.ce.TableSelection );
