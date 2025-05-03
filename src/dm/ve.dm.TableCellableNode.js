/*!
 * VisualEditor DataModel TableCellableNode class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel node which can behave as a table cell
 *
 * @class
 *
 * @abstract
 * @constructor
 */
ve.dm.TableCellableNode = function VeDmTableCellableNode() {
	// Events
	this.connect( this, {
		attributeChange: 'onCellableAttributeChange'
	} );
};

/* Inheritance */

OO.initClass( ve.dm.TableCellableNode );

/* Static Properties */

ve.dm.TableCellableNode.static.isCellable = true;

/* Static Methods */

ve.dm.TableCellableNode.static.areNodesCellable = function ( domNodes ) {
	// We can handle a DM node consisting of multiple table cell DOM elements with identical rowspan
	// as a table element. Give up on anything else.
	const cellElems = new Set( [ 'td', 'th' ] );
	return domNodes.every(
		( node ) => cellElems.has( node.nodeName.toLowerCase() ) &&
			node.rowspan === domNodes[ 0 ].rowspan
	);
};

/**
 * @typedef {Object} ve.dm.TableCellableNode.TableAttributes
 * @property {string} style 'header' or 'data'
 * @property {number} [rowspan]
 * @property {string} [originalRowspan]
 * @property {number} [colspan]
 * @property {string} [originalColspan]
 * @property {string} [align] DOM attribute align (deprecated)
 * @property {string} [valign] DOM attribute valign (deprecated)
 * @property {string} [textAlign] CSS property text-align
 * @property {string} [verticalAlign] CSS property vertical-align
 * @property {string} [originalTextAlign] CSS property text-align (original value)
 * @property {string} [originalVerticalAlign] CSS property vertical-align (original value)
 */

/**
 * @param {ve.dm.TableCellableNode.TableAttributes} attributes
 * @param {HTMLElement[]} domElements
 * @param {boolean} isAlien
 */
ve.dm.TableCellableNode.static.setAttributes = function ( attributes, domElements, isAlien ) {
	if ( isAlien ) {
		// For alienTableCells, we only need the colspan and rowspan, which
		// may need to be summed over an about-group (T366984).
		let colspan = 0, rowspan = 0;
		Array.prototype.forEach.call( domElements, ( node ) => {
			const attrs = {};
			this.setAttributes( attrs, [ node ], false );
			colspan += attrs.colspan || 1;
			// TODO: Support a non-rectangular alien group
			rowspan = Math.max( rowspan, attrs.rowspan || 1 );
		} );
		if ( colspan !== 1 ) {
			attributes.colspan = colspan;
		}
		if ( rowspan !== 1 ) {
			attributes.rowspan = rowspan;
		}
	} else {
		const style = domElements[ 0 ].nodeName.toLowerCase() === 'th' ? 'header' : 'data';
		const colspan = domElements[ 0 ].getAttribute( 'colspan' );
		const rowspan = domElements[ 0 ].getAttribute( 'rowspan' );

		attributes.style = style;

		if ( colspan !== null ) {
			attributes.originalColspan = colspan;
			if ( colspan !== '' && !isNaN( Number( colspan ) ) ) {
				attributes.colspan = Number( colspan );
			}
		}

		if ( rowspan !== null ) {
			attributes.originalRowspan = rowspan;
			if ( rowspan !== '' && !isNaN( Number( rowspan ) ) ) {
				attributes.rowspan = Number( rowspan );
			}
		}
	}
};

/**
 * @param {ve.dm.TableCellableNode.TableAttributes} attributes
 * @param {HTMLElement} domElement
 */
ve.dm.TableCellableNode.static.applyAttributes = function ( attributes, domElement ) {
	const spans = {
		colspan: attributes.colspan,
		rowspan: attributes.rowspan
	};

	// Ignore spans of 1 unless they were in the original HTML
	if ( attributes.colspan === 1 && Number( attributes.originalColspan ) !== 1 ) {
		spans.colspan = null;
	}

	if ( attributes.rowspan === 1 && Number( attributes.originalRowspan ) !== 1 ) {
		spans.rowspan = null;
	}

	// Use original value if the numerical value didn't change, or if we didn't set one
	if ( attributes.colspan === undefined || attributes.colspan === Number( attributes.originalColspan ) ) {
		spans.colspan = attributes.originalColspan;
	}

	if ( attributes.rowspan === undefined || attributes.rowspan === Number( attributes.originalRowspan ) ) {
		spans.rowspan = attributes.originalRowspan;
	}

	ve.setDomAttributes( domElement, spans );
};

/* Methods */

/**
 * Get the number of rows the cell spans
 *
 * @return {number} Rows spanned
 */
ve.dm.TableCellableNode.prototype.getRowspan = function () {
	return this.getAttribute( 'rowspan' ) || 1;
};

/**
 * Get the number of columns the cell spans
 *
 * @return {number} Columns spanned
 */
ve.dm.TableCellableNode.prototype.getColspan = function () {
	return this.getAttribute( 'colspan' ) || 1;
};

/**
 * Get number of columns and rows the cell spans
 *
 * @return {Object} Object containing 'col' and 'row'
 */
ve.dm.TableCellableNode.prototype.getSpans = function () {
	return {
		col: this.getColspan(),
		row: this.getRowspan()
	};
};

/**
 * Get the style of the cell
 *
 * @return {string} Style, 'header' or 'data'
 */
ve.dm.TableCellableNode.prototype.getStyle = function () {
	return this.getAttribute( 'style' ) || 'data';
};

/**
 * Handle attributes changes
 *
 * @param {string} key Attribute key
 * @param {string} from Old value
 * @param {string} to New value
 */
ve.dm.TableCellableNode.prototype.onCellableAttributeChange = function ( key ) {
	if ( this.getParent() && ( key === 'colspan' || key === 'rowspan' ) ) {
		// In practice the matrix should already be invalidated as you
		// shouldn't change a span without adding/removing other cells,
		// but it is possible to just change spans if you don't mind a
		// non-rectangular table.
		this.findParent( ve.dm.TableNode ).getMatrix().invalidate();
	}
};
