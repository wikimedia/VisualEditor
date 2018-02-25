/*!
 * VisualEditor DataModel rebase document state class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* eslint-env node, es6 */

/**
 * DataModel rebase document state
 *
 * @class
 *
 * @constructor
 */
ve.dm.RebaseDocState = function VeDmRebaseDocState() {
	/**
	 * @property {ve.dm.Change} history History as one big change
	 */
	this.history = new ve.dm.Change( 0, [], [], {} );

	/**
	 * @property {Map.<number, Object>} authors Information about each author
	 */
	this.authors = new Map();
};

/* Inheritance */

OO.initClass( ve.dm.RebaseDocState );

/* Static Methods */

/**
 * Get new empty author data object
 *
 * @return {Object} New empty author data object
 * @return {string} return.displayName Display name
 * @return {number} return.rejections Number of unacknowledged rejections
 * @return {ve.dm.Change|null} return.continueBase Continue base
 * @return {string} return.token Secret token for usurping sessions
 * @return {boolean} return.active Whether the author is active
 */
ve.dm.RebaseDocState.static.newAuthorData = function () {
	return {
		displayName: '',
		displayColor: '',
		rejections: 0,
		continueBase: null,
		// TODO use cryptographic randomness here and convert to hex
		token: Math.random().toString(),
		active: true
	};
};

/* Methods */

ve.dm.RebaseDocState.prototype.getActiveNames = function () {
	var result = {};
	this.authors.forEach( function ( authorData, authorId ) {
		if ( authorData.active ) {
			result[ authorId ] = authorData.displayName;
		}
	} );
	return result;
};
