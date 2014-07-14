/**
 * Menu of items, each an inspectablec attribute of the current context.
 *
 * Use with ve.ui.ContextItemWidget.
 *
 * @class
 * @extends OO.ui.SelectWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.ContextMenuWidget = function VeUiContextMenuWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	ve.ui.ContextMenuWidget.super.call( this, config );

	this.connect( this, { 'choose': 'onChooseItem' } );

	// Initialization
	this.$element.addClass( 've-ui-contextMenuWidget' );
};

/* Setup */

OO.inheritClass( ve.ui.ContextMenuWidget, OO.ui.SelectWidget );

/* Methods */

/**
 * Handle choose item events.
 */
ve.ui.ContextMenuWidget.prototype.onChooseItem = function () {
	// Auto-deselect
	this.selectItem( null );
};
