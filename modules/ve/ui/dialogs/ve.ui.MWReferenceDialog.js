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
	var focusedNode, doc, data,
	// Remove mwReference tool as you can't have nested references
		toolbarSubset = ve.init.mw.ViewPageTarget.static.getToolbarSubset( [
			// Can't have nested references
			'mwReference',
			// Lists not properly supported by PHP parser
			'number', 'bullet', 'outdent', 'indent'
		] );

	// Parent method
	ve.ui.Dialog.prototype.onOpen.call( this );

	// Get data from selection
	focusedNode = this.surface.getView().getFocusedNode();
	doc = this.surface.getModel().getDocument();
	if ( focusedNode instanceof ve.ce.MWReferenceNode ) {
		this.internalItem = focusedNode.getModel().getInternalItem();
		data = doc.getData( this.internalItem.getRange(), true );
	} else {
		data = [
			{
				'type': 'paragraph',
				'internal': {
					'generated': 'wrapper'
				}
			},
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
	this.$body.append( this.referenceToolbar.$, this.referenceSurface.$ );
	this.referenceToolbar.addTools( toolbarSubset );
	this.referenceSurface.addCommands( ve.init.mw.ViewPageTarget.static.surfaceCommands );
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
						'mw': {
							'name': 'ref'
						},
						'listIndex': newItem.index,
						'listGroup': 'mwReference/' + groupName,
						'listKey': key,
						'refGroup': groupName
					},
					//TODO: remove these htmlAttributes once fixed in Parsoid
					'htmlAttributes': [
						{
							'keys': [ 'data-parsoid' ],
							'values': {
								'data-parsoid': '{"src":""}'
							}
						}
					]
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
