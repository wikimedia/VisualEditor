/*!
 * VisualEditor InspectorAction class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Inspector action.
 *
 * @class
 * @extends ve.Action
 * @constructor
 * @param {ve.Surface} surface Surface to act on
 */
ve.InspectorAction = function VeInspectorAction( surface ) {
	// Parent constructor
	ve.Action.call( this, surface );
};

/* Inheritance */

ve.inheritClass( ve.InspectorAction, ve.Action );

/* Static Properties */

/**
 * List of allowed methods for the action.
 *
 * @static
 * @property
 */
ve.InspectorAction.static.methods = ['open', 'close'];

/* Methods */

/**
 * Open an inspector.
 *
 * @method
 * @param {string} name Symbolic name of inspector to open
 */
ve.InspectorAction.prototype.open = function ( name ) {
	this.surface.getContext().openInspector( name );
};

/**
 * Close any open inspector.
 *
 * @method
 * @param {boolean} remove Remove annotation being inspected
 */
ve.InspectorAction.prototype.close = function ( remove ) {
	this.surface.getContext().closeInspector( remove );
};

/* Registration */

ve.actionFactory.register( 'inspector', ve.InspectorAction );
