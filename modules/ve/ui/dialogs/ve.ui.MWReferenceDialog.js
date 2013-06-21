/*!
 * VisualEditor user interface MWReferenceDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Dialog for a MediaWiki reference.
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
	{ 'items': ['bold', 'italic', 'mwLink', 'clear', 'mwMediaInsert', 'mwTransclusion'] }
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

ve.ui.MWReferenceDialog.prototype.initialize = function () {
	// Parent method
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
	this.optionsFieldset.$.append(
		this.nameLabel.$,
		this.nameInput.$,
		this.groupLabel.$,
		this.groupInput.$
	);
	this.$body
		.append( this.contentFieldset.$, this.optionsFieldset.$ )
		.addClass( 've-ui-mwReferenceDialog-body' );
};

ve.ui.MWReferenceDialog.prototype.onOpen = function () {
	var focusedNode, data, refGroup, listKey,
		doc = this.surface.getModel().getDocument();

	// Parent method
	ve.ui.Dialog.prototype.onOpen.call( this );

	// Get reference content
	focusedNode = this.surface.getView().getFocusedNode();
	if ( focusedNode instanceof ve.ce.MWReferenceNode ) {
		this.internalItem = focusedNode.getModel().getInternalItem();
		data = doc.getData( this.internalItem.getRange(), true );
		listKey = focusedNode.getModel().getAttribute( 'listKey' );
		refGroup = focusedNode.getModel().getAttribute( 'refGroup' );
	} else {
		data = [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			{ 'type': '/paragraph' }
		];
	}

	this.referenceSurface = new ve.ui.Surface(
		new ve.dm.ElementLinearData( doc.getStore(), data ), { '$$': this.frame.$$ }
	);
	this.referenceToolbar = new ve.ui.Toolbar( this.referenceSurface, { '$$': this.frame.$$ } );

	// Initialization
	this.nameInput.setValue( listKey );
	this.groupInput.setValue( refGroup );
	this.referenceToolbar.$.addClass( 've-ui-mwReferenceDialog-toolbar' );
	this.contentFieldset.$.append( this.referenceToolbar.$, this.referenceSurface.$ );
	this.referenceToolbar.addTools( this.constructor.static.toolbarTools );
	this.referenceSurface.addCommands( this.constructor.static.surfaceCommands );
	this.referenceSurface.initialize();
	this.referenceSurface.view.documentView.documentNode.$.focus();
};

ve.ui.MWReferenceDialog.prototype.onClose = function ( action ) {
	var data, doc, listIndex, listGroup, listKey, refGroup, newItem, refNode, oldListGroup,
		oldListKey, oldNodes, internalList, attrChanges,
		surfaceModel = this.surface.getModel();

	// Parent method
	ve.ui.Dialog.prototype.onClose.call( this );

	// Save changes
	if ( action === 'apply' ) {
		data = this.referenceSurface.getModel().getDocument().getData();
		doc = surfaceModel.getDocument();
		listKey = this.nameInput.getValue() !== '' ? this.nameInput.getValue() : null;
		refGroup = this.groupInput.getValue();
		listGroup = 'mwReference/' + refGroup;
		if ( this.internalItem ) {
			// Edit reference: handle various replacement cases
			refNode = this.surface.getView().getFocusedNode().getModel();
			oldListGroup = refNode.getAttribute( 'listGroup' );
			oldListKey = refNode.getAttribute( 'listKey' );
			// Group/key has changed
			if ( listGroup !== oldListGroup || listKey !== oldListKey ) {
				internalList = doc.getInternalList();
				oldNodes = internalList.getNodeGroup( oldListGroup ).keyedNodes[oldListKey] || [];
				listIndex = internalList.getKeyIndex( listGroup, listKey );
				attrChanges = {};
				if ( listIndex !== undefined ) {
					// If the new key exists, reuse its internal node
					attrChanges.listIndex = listIndex;
				} else if ( oldNodes.length > 1 ) {
					// If the old internal node was being shared, create a new one
					newItem = internalList.getItemInsertion( listGroup, listKey, data );
					attrChanges.listIndex = newItem.index;
				}
				attrChanges.listGroup = listGroup;
				attrChanges.listKey = listKey;
				attrChanges.refGroup = refGroup;

				// Manually re-register the node before and after change
				refNode.removeFromInternalList();
				surfaceModel.change(
					ve.dm.Transaction.newFromAttributeChanges(
						doc, refNode.getOuterRange().start, attrChanges
					)
				);
				refNode.addToInternalList();
			}
			// Process the internal node create/edit transaction
			if ( !newItem ) {
				surfaceModel.change(
					ve.dm.Transaction.newFromNodeReplacement( doc, this.internalItem, data )
				);
			} else {
				surfaceModel.change( newItem.transaction );
			}
		} else {
			// Create reference: just create new nodes
			newItem = doc.getInternalList().getItemInsertion( listGroup, listKey, data );
			surfaceModel.change( newItem.transaction );
			surfaceModel.getFragment().collapseRangeToEnd().insertContent( [
				{
					'type': 'mwReference',
					'attributes': {
						'mw': { 'name': 'ref' },
						'listIndex': newItem.index,
						'listGroup': listGroup,
						'listKey': listKey,
						'refGroup': refGroup
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
