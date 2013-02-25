/*!
 * VisualEditor RangyRange class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * RangyRange.
 *
 * @class
 * @constructor
 * @param {HTMLElement} focusNode Selection focus node
 * @param {number} focusOffset Selection focus offset
 * @param {HTMLElement} anchorNode Selection anchor node
 * @param {number} anchorOffset Selection anchor offset
 */
ve.ce.RangyRange = function VeCeRangyRange( focusNode, focusOffset, anchorNode, anchorOffset ) {
	this.focusNode = focusNode;
	this.focusOffset = focusOffset;
	this.anchorNode = anchorNode;
	this.anchorOffset = anchorOffset;
};

/* Static Methods */

ve.ce.RangyRange.newFromRangySelection = function ( selection ) {
	return new ve.ce.RangyRange(
		selection.focusNode, selection.focusOffset, selection.anchorNode, selection.anchorOffset
	);
};

/* Methods */

ve.ce.RangyRange.prototype.equals = function ( other ) {
	return other &&
		this.focusNode === other.focusNode &&
		this.focusOffset === other.focusOffset &&
		this.anchorNode === other.anchorNode &&
		this.anchorOffset === other.anchorOffset;
};

ve.ce.RangyRange.prototype.getRange = function () {
	return new ve.Range(
		ve.ce.getOffset( this.anchorNode, this.anchorOffset ),
		ve.ce.getOffset( this.focusNode, this.focusOffset )
	);
};
