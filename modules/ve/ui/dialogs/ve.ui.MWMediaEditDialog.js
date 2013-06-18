/*!
 * VisualEditor user interface MWMediaEditDialog class.
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
ve.ui.MWMediaEditDialog = function VeUiMWMediaEditDialog( surface, config ) {
	// Parent constructor
	ve.ui.Dialog.call( this, surface, config );

	// Properties
	this.captionNode = null;
};

/* Inheritance */

ve.inheritClass( ve.ui.MWMediaEditDialog, ve.ui.Dialog );

/* Static Properties */

ve.ui.MWMediaEditDialog.static.titleMessage = 'visualeditor-dialog-media-title';

ve.ui.MWMediaEditDialog.static.icon = 'picture';

ve.ui.MWMediaEditDialog.static.modelClasses = [ ve.dm.MWBlockImageNode ];

ve.ui.MWMediaEditDialog.static.toolbarTools = [
	{ 'items': ['undo', 'redo'] },
	{ 'items': ['bold', 'italic', 'mwLink', 'clear'] }
];

ve.ui.MWMediaEditDialog.static.surfaceCommands = [
	'bold', 'italic', 'mwLink', 'undo', 'redo'
];

/* Static Initialization */

ve.ui.MWMediaEditDialog.static.addLocalStylesheets( [
	've.ce.Node.css',
	've.ce.Surface.css',
	've.ui.Surface.css',
	've.ui.Context.css',
	've.ui.Tool.css',
	've.ui.Toolbar.css'
] );

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MWMediaEditDialog.prototype.initialize = function () {
	// Call parent method
	ve.ui.Dialog.prototype.initialize.call( this );

	// Properties
	this.contentFieldset = new ve.ui.FieldsetLayout( {
		'$$': this.frame.$$,
		'label': ve.msg( 'visualeditor-dialog-media-content-section' ),
		'icon': 'parameter'
	} );

	// Initialization
	this.$body.addClass( 've-ui-mwMediaEditDialog-body' );
	this.$body.append( this.contentFieldset.$ );
};

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MWMediaEditDialog.prototype.onOpen = function () {
	var data, doc = this.surface.getModel().getDocument();

	// Parent method
	ve.ui.Dialog.prototype.onOpen.call( this );

	// Get caption content
	this.captionNode = this.surface.getView().getFocusedNode().getModel().getCaptionNode();
	if ( this.captionNode && this.captionNode.getLength() > 0 ) {
		data = doc.getData( this.captionNode.getRange(), true );
	} else {
		data = [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			{ 'type': '/paragraph' }
		];
	}

	this.captionSurface = new ve.ui.Surface(
		new ve.dm.ElementLinearData( doc.getStore(), data ), { '$$': this.frame.$$ }
	);
	this.captionToolbar = new ve.ui.Toolbar( this.captionSurface, { '$$': this.frame.$$ } );

	this.captionToolbar.$.addClass( 've-ui-mwMediaEditDialog-toolbar' );
	this.contentFieldset.$.append( this.captionToolbar.$, this.captionSurface.$ );
	this.captionToolbar.addTools( this.constructor.static.toolbarTools );
	this.captionSurface.addCommands( this.constructor.static.surfaceCommands );
	this.captionSurface.initialize();
	this.captionSurface.view.documentView.documentNode.$.focus();
};

/**
 * Handle frame ready events.
 *
 * @method
 * @param {string} action Action that caused the window to be closed
 */
ve.ui.MWMediaEditDialog.prototype.onClose = function ( action ) {
	var data, doc, surfaceModel = this.surface.getModel();

	// Parent method
	ve.ui.Dialog.prototype.onClose.call( this );

	if ( action === 'apply' ) {
		data = this.captionSurface.getModel().getDocument().getData();
		doc = surfaceModel.getDocument();
		if ( this.captionNode ) {
			// Replace the contents of the caption
			surfaceModel.getFragment( this.captionNode.getRange(), true ).insertContent( data );
		} else {
			// Insert a new caption at the beginning of the image node
			surfaceModel.getFragment()
				.adjustRange( 1 )
				.collapseRangeToStart()
				.insertContent(
					[ { 'type': 'mwImageCaption' } ]
						.concat( data )
						.concat( [ { 'type': '/mwImageCaption' } ] )
				);
		}
	}

	// Cleanup
	this.captionNode = null;
	this.captionSurface.destroy();
	this.captionToolbar.destroy();
};

/* Registration */

ve.ui.dialogFactory.register( 'mwMediaEdit', ve.ui.MWMediaEditDialog );

ve.ui.viewRegistry.register( 'mwMediaEdit', ve.ui.MWMediaEditDialog );
