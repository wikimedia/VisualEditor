/*!
 * VisualEditor PersistentContextItem class.
 *
 * @copyright 2011-2020 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Context item for a tool.
 *
 * @class
 * @extends ve.ui.LinearContextItem
 *
 * @param {ve.ui.LinearContext} context Context the item is in
 * @param {Object} [data] Extra data
 * @param {Object} [config] Configuration options
 */
ve.ui.PersistentContextItem = function VeUiPersistentContextItem( context, data, config ) {
	// Parent constructor
	ve.ui.PersistentContextItem.super.call( this, context, undefined, config );

	// Properties
	this.data = data;

	// Initialization
	this.$element.addClass( 've-ui-persistentContextItem' );
};

/* Inheritance */

OO.inheritClass( ve.ui.PersistentContextItem, ve.ui.LinearContextItem );

/* Static properties */

ve.ui.PersistentContextItem.static.editable = false;
