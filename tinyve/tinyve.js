/**
 * TinyVE - Toy version of VisualEditor to illustrate the main concepts
 */

tinyve = {};
tinyve.dm = {};
tinyve.ce = {};
tinyve.ui = {};

/**
 * Representation of a range in the linear model
 *
 * Sometimes direction matters, e.g. when representing a cursor selection, `from` is the anchor
 * and `to` is the focus.
 *
 * @class
 * @param {number} from Offset of where the range begins
 * @param {number} to Offset of where the range extends to (can be before `from`)
 */
tinyve.Range = function TinyVeRange( from, to ) {
	this.from = from;
	this.to = to;
	this.start = Math.min( from, to );
	this.end = Math.max( from, to );
};
