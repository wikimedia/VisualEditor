/*!
 * VisualEditor Table Selection class.
 *
 * @copyright See AUTHORS.txt
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
	this.directionality = null;
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
	const surface = this.getSurface(),
		tableNode = surface.getDocument().getBranchNodeFromOffset( this.model.tableRange.start + 1 ),
		nodes = tableNode.getCellNodesFromSelection( this.getModel() ),
		surfaceRect = surface.getSurface().getBoundingClientRect();

	let top = Infinity;
	let bottom = -Infinity;
	let left = Infinity;
	let right = -Infinity;

	const cellElements = [];
	nodes.forEach( ( node ) => {
		cellElements.push( ...node.$element.toArray() );
	} );

	// Compute a bounding box for the given cell elements
	cellElements.forEach( ( cellElement ) => {
		if ( !cellElement ) {
			return null;
		}
		const cellOffset = cellElement.getBoundingClientRect();

		top = Math.min( top, cellOffset.top );
		bottom = Math.max( bottom, cellOffset.bottom );
		left = Math.min( left, cellOffset.left );
		right = Math.max( right, cellOffset.right );
	} );

	// Browser tweaks to adjust for border-collapse:collapse
	if ( !ve.test ) {
		switch ( $.client.profile().layout ) {
			case 'webkit':
				right += 1;
				bottom += 1;
				break;
			case 'gecko':
				left -= 1;
				top -= 1;
				break;
		}
	}

	const boundingRect = {
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
	const surface = this.getSurface(),
		tableNode = surface.getDocument().getBranchNodeFromOffset( this.model.tableRange.start + 1 );

	if ( !tableNode ) {
		return null;
	}

	const surfaceRect = surface.getSurface().getBoundingClientRect();
	const boundingRect = tableNode.$element[ 0 ].getBoundingClientRect();

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
ve.ce.TableSelection.prototype.getDirectionality = function ( doc ) {
	if ( !this.directionality ) {
		this.directionality = doc.getDirectionalityFromRange( this.getModel().tableRange );
	}
	return this.directionality;
};

/* Registration */

ve.ce.selectionFactory.register( ve.ce.TableSelection );
