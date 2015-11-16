/*!
 * VisualEditor Table Selection class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
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
	var boundingRect = this.getSurface().getActiveTableNode().getSelectionBoundingRect( this.getModel() ),
		surfaceRect = this.getSurface().getSurface().getBoundingClientRect();

	if ( !boundingRect || !surfaceRect ) {
		return null;
	}
	return ve.translateRect( boundingRect, -surfaceRect.left, -surfaceRect.top );
};

/* Registration */

ve.ce.selectionFactory.register( ve.ce.TableSelection );
