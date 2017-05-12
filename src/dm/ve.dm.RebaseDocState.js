/*!
 * VisualEditor DataModel rebase document state class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
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
