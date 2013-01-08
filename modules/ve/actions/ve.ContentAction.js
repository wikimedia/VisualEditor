/*!
 * VisualEditor ContentAction class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Content action.
 *
 * @class
 * @extends ve.Action
 * @constructor
 * @param {ve.Surface} surface Surface to act on
 */
ve.ContentAction = function VeContentAction( surface ) {
	// Parent constructor
	ve.Action.call( this, surface );
};

/* Inheritance */

ve.inheritClass( ve.ContentAction, ve.Action );

/* Static Members */

/**
 * List of allowed methods for this action.
 *
 * @static
 * @property
 */
ve.ContentAction.static.methods = ['insert', 'remove', 'select'];

/* Methods */

/**
 * Sets a given Content.
 *
 * @method
 * @param {string|Array} content Content to insert, can be either a string or array of data
 * @param {boolean} annotate Content should be automatically annotated to match surrounding content
 */
ve.ContentAction.prototype.insert = function ( content, annotate ) {
	this.surface.getModel().getFragment().insertContent( content, annotate );
};

/**
 * Clears a given Content.
 *
 * @method
 */
ve.ContentAction.prototype.remove = function () {
	this.surface.getModel().getFragment().removeContent();
};

/**
 * Selects content in a given range.
 *
 * @method
 * @param {ve.Range} range Range to select
 */
ve.ContentAction.prototype.select = function ( range ) {
	this.surface.getModel().change( null, range );
};

/* Registration */

ve.actionFactory.register( 'content', ve.ContentAction );
