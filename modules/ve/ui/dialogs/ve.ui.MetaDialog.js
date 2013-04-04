/*!
 * VisualEditor user interface MetaDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Document dialog.
 *
 * @class
 * @abstract
 * @extends ve.ui.Dialog
 *
 * @constructor
 * @param {ve.Surface} surface
 */
ve.ui.MetaDialog = function VeUiMetaDialog( surface ) {
	// Parent constructor
	ve.ui.Dialog.call( this, surface );
};

/* Inheritance */

ve.inheritClass( ve.ui.MetaDialog, ve.ui.Dialog );

/* Static Properties */

ve.ui.MetaDialog.static.titleMessage = 'visualeditor-dialog-meta-title';

ve.ui.MetaDialog.static.icon = 'settings';

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MetaDialog.prototype.initialize = function () {
	// Call parent method
	ve.ui.Dialog.prototype.initialize.call( this );

	// Properties
	this.outlinePanel = new ve.ui.PanelLayout( { '$$': this.$$, 'scroll': true } );
	this.editorPanel = new ve.ui.StackPanelLayout( { '$$': this.$$ } );
	this.editorPanels = {
		'categories': new ve.ui.EditorPanelLayout( {
			'$$': this.$$, 'icon': 'tag', 'label': 'Categories'
		} ),
		'languages': new ve.ui.EditorPanelLayout( {
			'$$': this.$$, 'icon': 'language', 'label': 'Languages'
		} )
	};
	this.layout = new ve.ui.GridLayout(
		[this.outlinePanel, this.editorPanel],
		{ '$$': this.$$, 'widths': [1, 2] }
	);
	this.editorPanel.addItems( ve.getObjectValues( this.editorPanels ) );

	// HACK
	this.outlineWidget = new ve.ui.OutlineWidget( { '$$': this.$$ } );
	this.outlineWidget.addItems( [
		new ve.ui.OutlineItemWidget(
			'categories', { '$$': this.$$, 'icon': 'tag', 'label': 'Categories' }
		),
		new ve.ui.OutlineItemWidget(
			'languages', { '$$': this.$$, 'icon': 'language', 'label': 'Languages' }
		)
	] );
	this.outlineWidget
		.on( 'select', ve.bind( function ( item ) {
			this.editorPanel.showItem( this.editorPanels[item.getData()] );
		}, this ) )
		.selectItem( this.outlineWidget.getClosestSelectableItem( 0 ) );

	// Initialization
	this.outlinePanel.$.addClass( 've-ui-metaDialog-outlinePanel' );
	this.editorPanel.$.addClass( 've-ui-metaDialog-editorPanel' );
	this.$body.append( this.layout.$ );
	this.outlinePanel.$.append( this.outlineWidget.$ );
	this.layout.update();
};

/* Registration */

ve.ui.dialogFactory.register( 'meta', ve.ui.MetaDialog );
