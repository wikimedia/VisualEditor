/*!
 * VisualEditor Linear Selection class.
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
ve.ce.LinearSelection = function VeCeLinearSelection() {
	// Parent constructor
	ve.ce.LinearSelection.super.apply( this, arguments );

	// Properties
	this.directionality = null;
};

/* Inheritance */

OO.inheritClass( ve.ce.LinearSelection, ve.ce.Selection );

/* Static Properties */

ve.ce.LinearSelection.static.name = 'linear';

/* Method */

/**
 * @inheritdoc
 */
ve.ce.LinearSelection.prototype.getSelectionRects = function () {
	const surface = this.getSurface();

	const focusedNode = this.getFocusedNode();

	if ( focusedNode ) {
		return focusedNode.getRects();
	}

	const range = this.getModel().getRange();
	const nativeRange = surface.getNativeRange( range );
	if ( !nativeRange ) {
		return null;
	}

	let rects = [];
	// Support: Firefox, IE
	// Calling getClientRects sometimes fails:
	// * in Firefox on page load when the address bar is still focused
	// * in empty paragraphs
	// * near annotation nails
	try {
		rects = RangeFix.getClientRects( nativeRange );
		if ( !rects.length ) {
			throw new Error( 'getClientRects returned empty list' );
		}
	} catch ( e ) {
		const rect = this.getNodeClientRectFromRange( nativeRange );
		if ( rect ) {
			rects = [ rect ];
		}
	}

	const surfaceRect = surface.getSurface().getBoundingClientRect();
	if ( !rects || !surfaceRect ) {
		return null;
	}

	// TODO: Use .map
	const relativeRects = [];
	for ( let i = 0, l = rects.length; i < l; i++ ) {
		relativeRects.push( ve.translateRect( rects[ i ], -surfaceRect.left, -surfaceRect.top ) );
	}
	return relativeRects;
};

/**
 * @inheritdoc
 */
ve.ce.LinearSelection.prototype.getSelectionStartAndEndRects = function () {
	const focusedNode = this.getFocusedNode();

	if ( focusedNode ) {
		return focusedNode.getStartAndEndRects();
	}

	return ve.getStartAndEndRects( this.getSelectionRects() );
};

/**
 * @inheritdoc
 */
ve.ce.LinearSelection.prototype.getSelectionBoundingRect = function () {
	const surface = this.getSurface();

	const focusedNode = this.getFocusedNode();

	if ( focusedNode ) {
		return focusedNode.getBoundingRect();
	}

	const range = this.getModel().getRange();
	const nativeRange = surface.getNativeRange( range );
	if ( !nativeRange ) {
		return null;
	}

	let boundingRect;
	try {
		boundingRect = RangeFix.getBoundingClientRect( nativeRange );
	} catch ( e ) {
		boundingRect = null;
	}
	if ( !boundingRect ) {
		boundingRect = this.getNodeClientRectFromRange( nativeRange );
	}

	const surfaceRect = surface.getSurface().getBoundingClientRect();
	if ( !boundingRect || !surfaceRect ) {
		return null;
	}
	return ve.translateRect( boundingRect, -surfaceRect.left, -surfaceRect.top );
};

/**
 * Get a client rect from the range's end node
 *
 * This function is used internally by getSelectionRects and
 * getSelectionBoundingRect as a fallback when Range.getClientRects
 * fails. The width is hard-coded to 0 as the function is used to
 * locate the selection focus position.
 *
 * @private
 * @param {Range} range Range to get client rect for
 * @return {Object|null} ClientRect-like object
 */
ve.ce.LinearSelection.prototype.getNodeClientRectFromRange = function ( range ) {
	const containerNode = range.endContainer,
		offset = range.endOffset;

	let node;
	let fixHeight;
	if ( containerNode.nodeType === Node.TEXT_NODE && ( offset === 0 || offset === containerNode.length ) ) {
		node = offset ? containerNode.previousSibling : containerNode.nextSibling;
	} else if ( containerNode.nodeType === Node.ELEMENT_NODE ) {
		node = offset === containerNode.childNodes.length ? containerNode.lastChild : containerNode.childNodes[ offset ];
		// Nail heights are 0, so use the annotation's height
		if ( node && node.nodeType === Node.ELEMENT_NODE && node.classList.contains( 've-ce-nail' ) ) {
			const annotationNode = offset ? node.previousSibling : node.nextSibling;
			// Sometimes annotationNode isn't an HTMLElement (T261992). Not sure
			// when this happens, but we will still return a sensible rectangle
			// without fixHeight isn't set.
			if ( annotationNode instanceof HTMLElement ) {
				fixHeight = annotationNode.offsetHeight;
			}
		}
	} else {
		node = containerNode;
	}

	while ( node && node.nodeType !== Node.ELEMENT_NODE ) {
		node = node.parentNode;
	}

	if ( !node ) {
		return null;
	}

	// When possible, pretend the cursor is the left/right border of the node
	// (depending on directionality) as a fallback.

	// We would use getBoundingClientRect(), but in iOS7 that's relative to the
	// document rather than to the viewport
	const rect = node.getClientRects()[ 0 ];
	if ( !rect ) {
		// FF can return null when focusNode is invisible
		return null;
	}

	const side = $( node ).css( 'direction' ) === 'rtl' ? 'right' : 'left';
	const adjacentNode = range.endContainer.childNodes[ range.endOffset ];
	let x;
	if ( range.collapsed && adjacentNode && adjacentNode.classList && adjacentNode.classList.contains( 've-ce-unicorn' ) ) {
		// We're next to a unicorn; use its left/right position
		const unicornRect = adjacentNode.getClientRects()[ 0 ];
		if ( !unicornRect ) {
			return null;
		}
		x = unicornRect[ side ];
	} else {
		x = rect[ side ];
	}

	if ( fixHeight ) {
		// Use a pre-computed height from above, maintaining the vertical center
		const middle = ( rect.top + rect.bottom ) / 2;
		return {
			top: middle - ( fixHeight / 2 ),
			bottom: middle + ( fixHeight / 2 ),
			left: x,
			right: x,
			width: 0,
			height: fixHeight
		};
	} else {
		return {
			top: rect.top,
			bottom: rect.bottom,
			left: x,
			right: x,
			width: 0,
			height: rect.height
		};
	}
};

/**
 * @inheritdoc
 */
ve.ce.LinearSelection.prototype.getSelectionFocusRect = function () {
	return !this.isNativeCursor() ?
		// Don't collapse selection for focus rect if we are on a focusable node.
		this.getSelectionBoundingRect() :
		ve.ce.LinearSelection.super.prototype.getSelectionFocusRect.call( this );
};

/**
 * Get the focusable node at the selection
 *
 * @return {ve.ce.Node|null} Focused node
 */
ve.ce.LinearSelection.prototype.getFocusedNode = function () {
	return this.getSurface().getFocusedNode( this.getModel().getRange() );
};

/**
 * @inheritdoc
 */
ve.ce.LinearSelection.prototype.isFocusedNode = function () {
	return !!this.getFocusedNode();
};

/**
 * @inheritdoc
 */
ve.ce.LinearSelection.prototype.isNativeCursor = function () {
	return !this.getFocusedNode();
};

/**
 * @inheritdoc
 */
ve.ce.LinearSelection.prototype.getDirectionality = function ( doc ) {
	if ( !this.directionality ) {
		this.directionality = doc.getDirectionalityFromRange( this.getModel().getRange() );
	}
	return this.directionality;
};

/* Registration */

ve.ce.selectionFactory.register( ve.ce.LinearSelection );
