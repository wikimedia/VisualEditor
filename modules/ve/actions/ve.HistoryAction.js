/*!
 * VisualEditor HistoryAction class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * History action.
 *
 * @class
 * @extends ve.Action
 * @constructor
 * @param {ve.Surface} surface Surface to act on
 */
ve.HistoryAction = function VeHistoryAction( surface ) {
	// Parent constructor
	ve.Action.call( this, surface );
};

/* Inheritance */

ve.inheritClass( ve.HistoryAction, ve.Action );

/* Static Properties */

/**
 * List of allowed methods for the action.
 *
 * @static
 * @property
 */
ve.HistoryAction.static.methods = ['undo', 'redo'];

/* Methods */

/**
 * Step backwards in time.
 *
 * @method
 */
ve.HistoryAction.prototype.undo = function () {
	var range = this.surface.getModel().undo();
	if ( range ) {
		this.surface.getView().showSelection( range );
	}
};

/**
 * Step forwards in time.
 *
 * @method
 */
ve.HistoryAction.prototype.redo = function () {
	var range = this.surface.getModel().redo();
	if ( range ) {
		this.surface.getView().showSelection( range );
	}
};

/* Registration */

ve.actionFactory.register( 'history', ve.HistoryAction );
