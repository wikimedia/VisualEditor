/*!
 * VisualEditor TableContextItem class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Context item for a table tool.
 *
 * @class
 * @abstract
 * @extends ve.ui.ContextItem
 *
 * @param {ve.ui.Context} context Context item is in
 * @param {ve.dm.Model} model Model the item is related to
 * @param {Function} tool Tool class the item is based on
 * @param {Object} config Configuration options
 */
ve.ui.TableContextItem = function VeTableContextItem() {
	// Parent constructor
	ve.ui.TableContextItem.super.apply( this, arguments );

	// Initialization
	this.$title.remove();
	this.$info.remove();
	this.editButton.toggleFramed( false ).clearFlags();
	this.$element.addClass( 've-ui-tableContextItem' );
};

/* Inheritance */

OO.inheritClass( ve.ui.TableContextItem, ve.ui.ContextItem );

/* Static Properties */

ve.ui.TableContextItem.static.name = 'table';

/**
 * Title to use for context item action
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.ui.TableContextItem.static.title = null;

/* Methods */

/**
 * Get the title of the tool, used by the button label
 *
 * @return {jQuery|string|OO.ui.HtmlSnippet|Function} Tool title
 */
ve.ui.TableContextItem.prototype.getTitle = function () {
	return this.constructor.static.title;
};

/**
 * @inheritdoc
 */
ve.ui.TableContextItem.prototype.setup = function () {
	// Parent method
	ve.ui.TableContextItem.super.prototype.setup.call( this );

	this.editButton
		.setIcon( this.constructor.static.icon )
		.setLabel( this.getTitle() );
};

/* Specific tools */

ve.ui.InsertColumnBeforeContextItem = function VeUiInsertColumnBeforeContextItem() {
	ve.ui.InsertColumnBeforeContextItem.super.apply( this, arguments );
};
OO.inheritClass( ve.ui.InsertColumnBeforeContextItem, ve.ui.TableContextItem );
ve.ui.InsertColumnBeforeContextItem.static.name = 'insertColumnBefore';
ve.ui.InsertColumnBeforeContextItem.static.group = 'table-col';
ve.ui.InsertColumnBeforeContextItem.static.icon = 'table-insert-column-before';
ve.ui.InsertColumnBeforeContextItem.static.title =
	OO.ui.deferMsg( 'visualeditor-table-insert-col-before' );
ve.ui.InsertColumnBeforeContextItem.static.commandName = 'insertColumnBefore';
ve.ui.contextItemFactory.register( ve.ui.InsertColumnBeforeContextItem );

ve.ui.InsertColumnAfterContextItem = function VeUiInsertColumnAfterContextItem() {
	ve.ui.InsertColumnAfterContextItem.super.apply( this, arguments );
};
OO.inheritClass( ve.ui.InsertColumnAfterContextItem, ve.ui.TableContextItem );
ve.ui.InsertColumnAfterContextItem.static.name = 'insertColumnAfter';
ve.ui.InsertColumnAfterContextItem.static.group = 'table-col';
ve.ui.InsertColumnAfterContextItem.static.icon = 'table-insert-column-after';
ve.ui.InsertColumnAfterContextItem.static.title =
	OO.ui.deferMsg( 'visualeditor-table-insert-col-after' );
ve.ui.InsertColumnAfterContextItem.static.commandName = 'insertColumnAfter';
ve.ui.contextItemFactory.register( ve.ui.InsertColumnAfterContextItem );

ve.ui.DeleteColumnContextItem = function VeUiDeleteColumnContextItem() {
	ve.ui.DeleteColumnContextItem.super.apply( this, arguments );
};
OO.inheritClass( ve.ui.DeleteColumnContextItem, ve.ui.TableContextItem );
ve.ui.DeleteColumnContextItem.static.name = 'deleteColumn';
ve.ui.DeleteColumnContextItem.static.group = 'table-col';
ve.ui.DeleteColumnContextItem.static.icon = 'remove';
ve.ui.DeleteColumnContextItem.static.title =
	OO.ui.deferMsg( 'visualeditor-table-delete-col' );
ve.ui.DeleteColumnContextItem.static.commandName = 'deleteColumn';
ve.ui.contextItemFactory.register( ve.ui.DeleteColumnContextItem );

ve.ui.InsertRowBeforeContextItem = function VeUiInsertRowBeforeContextItem() {
	ve.ui.InsertRowBeforeContextItem.super.apply( this, arguments );
};
OO.inheritClass( ve.ui.InsertRowBeforeContextItem, ve.ui.TableContextItem );
ve.ui.InsertRowBeforeContextItem.static.name = 'insertRowBefore';
ve.ui.InsertRowBeforeContextItem.static.group = 'table-row';
ve.ui.InsertRowBeforeContextItem.static.icon = 'table-insert-row-before';
ve.ui.InsertRowBeforeContextItem.static.title =
	OO.ui.deferMsg( 'visualeditor-table-insert-row-before' );
ve.ui.InsertRowBeforeContextItem.static.commandName = 'insertRowBefore';
ve.ui.contextItemFactory.register( ve.ui.InsertRowBeforeContextItem );

ve.ui.InsertRowAfterContextItem = function VeUiInsertRowAfterContextItem() {
	ve.ui.InsertRowAfterContextItem.super.apply( this, arguments );
};
OO.inheritClass( ve.ui.InsertRowAfterContextItem, ve.ui.TableContextItem );
ve.ui.InsertRowAfterContextItem.static.name = 'insertRowAfter';
ve.ui.InsertRowAfterContextItem.static.group = 'table-row';
ve.ui.InsertRowAfterContextItem.static.icon = 'table-insert-row-after';
ve.ui.InsertRowAfterContextItem.static.title =
	OO.ui.deferMsg( 'visualeditor-table-insert-row-after' );
ve.ui.InsertRowAfterContextItem.static.commandName = 'insertRowAfter';
ve.ui.contextItemFactory.register( ve.ui.InsertRowAfterContextItem );

ve.ui.DeleteRowContextItem = function VeUiDeleteRowContextItem() {
	ve.ui.DeleteRowContextItem.super.apply( this, arguments );
};
OO.inheritClass( ve.ui.DeleteRowContextItem, ve.ui.TableContextItem );
ve.ui.DeleteRowContextItem.static.name = 'deleteRow';
ve.ui.DeleteRowContextItem.static.group = 'table-row';
ve.ui.DeleteRowContextItem.static.icon = 'remove';
ve.ui.DeleteRowContextItem.static.title =
	OO.ui.deferMsg( 'visualeditor-table-delete-row' );
ve.ui.DeleteRowContextItem.static.commandName = 'deleteRow';
ve.ui.contextItemFactory.register( ve.ui.DeleteRowContextItem );
