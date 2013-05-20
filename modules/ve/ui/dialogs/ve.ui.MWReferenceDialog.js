/*!
 * VisualEditor user interface MWReferenceDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Document dialog.
 *
 * @class
 * @extends ve.ui.Dialog
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Config options
 */
ve.ui.MWReferenceDialog = function VeUiMWReferenceDialog( surface, config ) {
	// Parent constructor
	ve.ui.Dialog.call( this, surface, config );

	// Properties
	this.referenceNode = null;
	this.internalItem = null;
};

/* Inheritance */

ve.inheritClass( ve.ui.MWReferenceDialog, ve.ui.Dialog );

/* Static Properties */

ve.ui.MWReferenceDialog.static.titleMessage = 'visualeditor-dialog-reference-title';

ve.ui.MWReferenceDialog.static.icon = 'reference';

ve.ui.MWReferenceDialog.static.modelClasses = [ ve.dm.MWReferenceNode ];

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MWReferenceDialog.prototype.initialize = function () {
	// Call parent method
	ve.ui.Dialog.prototype.initialize.call( this );

	// Initialization
	this.$body.addClass( 've-ui-mwReferenceDialog-body' );
};

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MWReferenceDialog.prototype.onOpen = function () {
	var doc = this.surface.getModel().getDocument();

	// Parent method
	ve.ui.Dialog.prototype.onOpen.call( this );

	this.referenceNode = this.surface.getView().getFocusedNode();
	this.internalItem = this.referenceNode.getModel().getInternalItem();

	// Properties
	this.referenceSurface = new ve.ui.Surface(
		// TODO: Move these details into something like ve.dm.SurfaceFragment
		new ve.dm.ElementLinearData(
			doc.getStore(), doc.getData( this.internalItem.getRange(), true )
		),
		{ '$$': this.frame.$$ }
	);
	this.referenceToolbar = new ve.ui.Toolbar(
		this.referenceSurface, { '$$': this.frame.$$ }
	);

	// Initialization
	this.referenceToolbar.$.addClass( 've-ui-mwReferenceDialog-toolbar' );
	this.$body.append( this.referenceToolbar.$, this.referenceSurface.$ );
	this.referenceToolbar.addTools( ve.init.mw.ViewPageTarget.static.toolbarTools );
	this.referenceSurface.addCommands( ve.init.mw.ViewPageTarget.static.surfaceCommands );
	this.referenceSurface.initialize();
};

/**
 * Handle frame ready events.
 *
 * @method
 * @param {string} action Action that caused the window to be closed
 */
ve.ui.MWReferenceDialog.prototype.onClose = function ( action ) {
	var tx,
		doc = this.surface.getModel().getDocument();

	// Parent method
	ve.ui.Dialog.prototype.onOpen.call( this );

	// TODO: Make this actually work
	if ( action === 'apply' ) {
		tx = ve.dm.Transaction.newFromNodeReplacement(
			doc,
			this.internalItem.getRange(),
			this.referenceSurface.getModel().getDocument().getData()
		);
		this.surface.getModel().change( tx );
	}

	// Cleanup
	this.referenceSurface.destroy();
	this.referenceToolbar.destroy();
};

/* Initialization */

ve.ui.MWReferenceDialog.static.addLocalStylesheets( [
	've.ce.Node.css',
	've.ce.Surface.css',
	've.ui.Surface.css',
	've.ui.Context.css',
	've.ui.Tool.css',
	've.ui.Toolbar.css'
] );

/* Registration */

ve.ui.dialogFactory.register( 'mwReference', ve.ui.MWReferenceDialog );

ve.ui.viewRegistry.register( 'mwReference', ve.ui.MWReferenceDialog );
