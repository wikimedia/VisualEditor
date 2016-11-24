/*!
 * VisualEditor DiffMatchPatch implementation for linear model
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* global diff_match_patch */

/**
 * DiffMatchPatch implementation
 *
 * @class
 * @extends diff_match_patch
 * @constructor
 * @param {ve.dm.IndexValueStore} oldStore
 * @param {ve.dm.IndexValueStore} newStore
 */
ve.DiffMatchPatch = function VeDiffMatchPatch( oldStore, newStore ) {
	// Parent constructor
	ve.DiffMatchPatch.super.call( this );

	this.store = oldStore.clone();
	this.store.merge( newStore );
};

/* Inheritance */

OO.inheritClass( ve.DiffMatchPatch, diff_match_patch );

/* Methods */

ve.DiffMatchPatch.prototype.isEqualChar = function ( a, b ) {
	return a === b || ve.dm.ElementLinearData.static.compareElements( a, b, this.store, this.store );
};

ve.DiffMatchPatch.prototype.isEqualString = function ( a, b ) {
	var i, l;

	if ( a === b ) {
		return true;
	}
	if ( a === null || b === null ) {
		return false;
	}
	if ( a.length !== b.length ) {
		return false;
	}

	for ( i = 0, l = a.length; i < l; i++ ) {
		if ( !this.isEqualChar( a[ i ], b[ i ] ) ) {
			return false;
		}
	}
	return true;
};

ve.DiffMatchPatch.prototype.charsToString = function ( chars ) {
	return chars.slice();
};

ve.DiffMatchPatch.prototype.getEmptyString = function () {
	return [];
};
