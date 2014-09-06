/*!
 * VisualEditor DomRange class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * DOM range
 *
 * @class
 * @constructor
 * @param {HTMLElement} focusNode Selection focus node
 * @param {number} focusOffset Selection focus offset
 * @param {HTMLElement} anchorNode Selection anchor node
 * @param {number} anchorOffset Selection anchor offset
 */
ve.ce.DomRange = function VeCeDomRange( focusNode, focusOffset, anchorNode, anchorOffset ) {
	this.focusNode = focusNode;
	this.focusOffset = focusOffset;
	this.anchorNode = anchorNode;
	this.anchorOffset = anchorOffset;
};

/* Static Methods */

/**
 * Create a new DOM range from a document's native selection
 *
 * @param {HTMLDocument} doc Document to get selection from
 * @return {ve.ce.DomRange} DOM range
 */
ve.ce.DomRange.newFromDocument = function ( doc ) {
	var selection = doc.getSelection();
	return new ve.ce.DomRange(
		selection.focusNode, selection.focusOffset, selection.anchorNode, selection.anchorOffset
	);
};

/* Methods */

/**
 * Check if a DOM range is equal to another DOM range
 *
 * @param {ve.ce.DomRange} other DOM range to compare to
 * @return {boolean} The other DOM range is equal to this one
 */
ve.ce.DomRange.prototype.equals = function ( other ) {
	return other &&
		this.focusNode === other.focusNode &&
		this.focusOffset === other.focusOffset &&
		this.anchorNode === other.anchorNode &&
		this.anchorOffset === other.anchorOffset;
};

/**
 * Get a linear model ve.Range for the DOM range
 *
 * @returns {ve.Range|null} Linear model range, or null if out of bounds
 */
ve.ce.DomRange.prototype.getRange = function () {
	try {
		return new ve.Range(
			ve.ce.getOffset( this.anchorNode, this.anchorOffset ),
			ve.ce.getOffset( this.focusNode, this.focusOffset )
		);
	} catch ( e ) {
		return null;
	}
};
