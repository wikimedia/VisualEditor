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
	this.internalItem = null;
};

/* Inheritance */

ve.inheritClass( ve.ui.MWReferenceDialog, ve.ui.Dialog );

/* Static Properties */

ve.ui.MWReferenceDialog.static.titleMessage = 'visualeditor-dialog-reference-title';

ve.ui.MWReferenceDialog.static.icon = 'reference';

ve.ui.MWReferenceDialog.static.modelClasses = [ ve.dm.MWReferenceNode ];

ve.ui.MWReferenceDialog.static.toolbarTools = [
	{ 'items': ['undo', 'redo'] },
	{ 'items': ['mwFormat'] },
	{ 'items': ['bold', 'italic', 'mwLink', 'clear', 'mwMediaInsert'] }
];

ve.ui.MWReferenceDialog.static.surfaceCommands = [
	'bold', 'italic', 'mwLink', 'undo', 'redo'
];

/* Static Initialization */

ve.ui.MWReferenceDialog.static.addLocalStylesheets( [
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
ve.ui.MWReferenceDialog.prototype.initialize = function () {
	// Call parent method
	ve.ui.Dialog.prototype.initialize.call( this );

	// Properties
	this.contentFieldset = new ve.ui.FieldsetLayout( {
		'$$': this.frame.$$,
		'label': ve.msg( 'visualeditor-dialog-reference-content-section' ),
		'icon': 'reference'
	} );
	this.optionsFieldset = new ve.ui.FieldsetLayout( {
		'$$': this.frame.$$,
		'label': ve.msg( 'visualeditor-dialog-reference-options-section' ),
		'icon': 'settings'
	} );
	this.nameInput = new ve.ui.TextInputWidget( { '$$': this.frame.$$ } );
	this.nameLabel = new ve.ui.InputLabelWidget( {
		'$$': this.frame.$$,
		'input': this.nameInput,
		'label': ve.msg( 'visualeditor-dialog-reference-options-name-label' )
	} );

	this.groupInput = new ve.ui.TextInputWidget( { '$$': this.frame.$$ } );
	this.groupLabel = new ve.ui.InputLabelWidget( {
		'$$': this.frame.$$,
		'input': this.groupInput,
		'label': ve.msg( 'visualeditor-dialog-reference-options-group-label' )
	} );

	// Initialization
	this.$body.addClass( 've-ui-mwReferenceDialog-body' );
	this.$body.append( this.contentFieldset.$, this.optionsFieldset.$ );
	this.optionsFieldset.$.append(
		this.nameLabel.$, this.nameInput.$, this.groupLabel.$, this.groupInput.$
	);
};

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MWReferenceDialog.prototype.onOpen = function () {
	var focusedNode, data,
		doc = this.surface.getModel().getDocument();

	// Parent method
	ve.ui.Dialog.prototype.onOpen.call( this );

	// Get reference content
	focusedNode = this.surface.getView().getFocusedNode();
	if ( focusedNode instanceof ve.ce.MWReferenceNode ) {
		this.internalItem = focusedNode.getModel().getInternalItem();
		data = doc.getData( this.internalItem.getRange(), true );
	} else {
		data = [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			{ 'type': '/paragraph' }
		];
	}

	// Properties
	this.referenceSurface = new ve.ui.Surface(
		new ve.dm.ElementLinearData( doc.getStore(), data ), { '$$': this.frame.$$ }
	);
	this.referenceToolbar = new ve.ui.Toolbar( this.referenceSurface, { '$$': this.frame.$$ } );

	// Initialization
	this.referenceToolbar.$.addClass( 've-ui-mwReferenceDialog-toolbar' );
	this.contentFieldset.$.append( this.referenceToolbar.$, this.referenceSurface.$ );
	this.referenceToolbar.addTools( this.constructor.static.toolbarTools );
	this.referenceSurface.addCommands( this.constructor.static.surfaceCommands );
	this.referenceSurface.initialize();
	this.referenceSurface.view.documentView.documentNode.$.focus();
};

/**
 * Handle frame ready events.
 *
 * @method
 * @param {string} action Action that caused the window to be closed
 */
ve.ui.MWReferenceDialog.prototype.onClose = function ( action ) {
	var data, doc, groupName, key, newItem,
		txs = [];

	// Parent method
	ve.ui.Dialog.prototype.onOpen.call( this );

	// Save changes
	if ( action === 'apply' ) {
		data = this.referenceSurface.getModel().getDocument().getData();
		doc = this.surface.getModel().getDocument();
		if ( this.internalItem ) {
			txs.push(
				ve.dm.Transaction.newFromNodeReplacement(
					doc, this.internalItem.getRange(), data
				)
			);
			this.surface.getModel().change( txs );
		} else {
			// TODO: pass in group and key from UI if they exist
			groupName = '';
			key = null;
			newItem = doc.getInternalList().getItemInsertion( groupName, key, data );
			if ( newItem.transaction ) {
				txs.push( newItem.transaction );
			}
			this.surface.getModel().change( txs );
			this.surface.getModel().getFragment().collapseRangeToEnd().insertContent( [
				{
					'type': 'mwReference',
					'attributes': {
						'mw': { 'name': 'ref' },
						'listIndex': newItem.index,
						'listGroup': 'mwReference/' + groupName,
						'listKey': key,
						'refGroup': groupName
					}
				},
				{ 'type': '/mwReference' }
			] );
		}
	}

	// Cleanup
	this.internalItem = null;
	this.referenceSurface.destroy();
	this.referenceToolbar.destroy();
};

/* Registration */

ve.ui.dialogFactory.register( 'mwReference', ve.ui.MWReferenceDialog );

ve.ui.viewRegistry.register( 'mwReference', ve.ui.MWReferenceDialog );
