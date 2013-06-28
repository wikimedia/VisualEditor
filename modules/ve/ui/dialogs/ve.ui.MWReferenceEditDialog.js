/*!
 * VisualEditor user interface MWReferenceEditDialog class.
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
ve.ui.MWReferenceEditDialog = function VeUiMWReferenceEditDialog( surface, config ) {
	// Parent constructor
	ve.ui.Dialog.call( this, surface, config );

	// Properties
	this.internalItem = null;
};

/* Inheritance */

ve.inheritClass( ve.ui.MWReferenceEditDialog, ve.ui.Dialog );

/* Static Properties */

ve.ui.MWReferenceEditDialog.static.titleMessage = 'visualeditor-dialog-reference-title';

ve.ui.MWReferenceEditDialog.static.icon = 'reference';

ve.ui.MWReferenceEditDialog.static.toolbarTools = [
	{ 'items': ['undo', 'redo'] },
	{ 'items': ['bold', 'italic', 'mwLink', 'clear', 'mwMediaInsert', 'mwTransclusion'] }
];

ve.ui.MWReferenceEditDialog.static.surfaceCommands = [
	'bold', 'italic', 'mwLink', 'undo', 'redo'
];

/* Static Initialization */

ve.ui.MWReferenceEditDialog.static.addLocalStylesheets( [
	've.ce.Node.css',
	've.ce.Surface.css',
	've.ui.Surface.css',
	've.ui.Context.css',
	've.ui.Tool.css',
	've.ui.Toolbar.css'
] );

/* Methods */

ve.ui.MWReferenceEditDialog.prototype.initialize = function () {
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

	// TODO: Use a drop-down or something, and populate with existing groups instead of free-text
	this.groupInput = new ve.ui.TextInputWidget( { '$$': this.frame.$$ } );
	this.groupLabel = new ve.ui.InputLabelWidget( {
		'$$': this.frame.$$,
		'input': this.groupInput,
		'label': ve.msg( 'visualeditor-dialog-reference-options-group-label' )
	} );

	// Initialization
	this.optionsFieldset.$.append(
		this.groupLabel.$,
		this.groupInput.$
	);
	this.$body
		.append( this.contentFieldset.$, this.optionsFieldset.$ )
		.addClass( 've-ui-mwReferenceEditDialog-body' );
};

ve.ui.MWReferenceEditDialog.prototype.onOpen = function () {
	var focusedNode, data, refGroup,
		doc = this.surface.getModel().getDocument();

	// Parent method
	ve.ui.Dialog.prototype.onOpen.call( this );

	// Get reference content
	focusedNode = this.surface.getView().getFocusedNode();
	this.internalItem = focusedNode.getModel().getInternalItem();
	data = doc.getData( this.internalItem.getRange(), true );
	refGroup = focusedNode.getModel().getAttribute( 'refGroup' );

	// Properties
	this.referenceSurface = new ve.ui.Surface(
		new ve.dm.ElementLinearData( doc.getStore(), data ), { '$$': this.frame.$$ }
	);
	this.referenceToolbar = new ve.ui.Toolbar( this.referenceSurface, { '$$': this.frame.$$ } );

	// Initialization
	this.groupInput.setValue( refGroup );
	this.referenceToolbar.$.addClass( 've-ui-mwReferenceEditDialog-toolbar' );
	this.contentFieldset.$.append( this.referenceToolbar.$, this.referenceSurface.$ );
	this.referenceToolbar.addTools( this.constructor.static.toolbarTools );
	this.referenceSurface.addCommands( this.constructor.static.surfaceCommands );
	this.referenceSurface.initialize();
	this.referenceSurface.view.documentView.documentNode.$.focus();
};

ve.ui.MWReferenceEditDialog.prototype.onClose = function ( action ) {
	var i, len, txs, data, doc, group, listGroup, listKey, refGroup, newItem, refNode,
		oldListGroup, refNodes, internalList, attr,
		surfaceModel = this.surface.getModel();

	// Parent method
	ve.ui.Dialog.prototype.onClose.call( this );

	// Save changes
	if ( action === 'apply' ) {
		data = this.referenceSurface.getModel().getDocument().getData();
		doc = surfaceModel.getDocument();
		refGroup = this.groupInput.getValue();
		listGroup = 'mwReference/' + refGroup;
		refNode = this.surface.getView().getFocusedNode().getModel();
		oldListGroup = refNode.getAttribute( 'listGroup' );
		listKey = refNode.getAttribute( 'listKey' );
		// Group/key has changed
		if ( listGroup !== oldListGroup ) {
			internalList = doc.getInternalList();
			attr = {
				'listGroup': listGroup,
				'refGroup': refGroup
			};
			if ( internalList.getKeyIndex( listGroup, listKey ) !== undefined ) {
				// Resolve name collision by generating a new list key
				attr.listKey = internalList.getUniqueListKey( listGroup );
			}

			// Update the group name of all references nodes in this group with this key
			group = internalList.getNodeGroup( oldListGroup );
			refNodes = group.keyedNodes[listKey] ? group.keyedNodes[listKey].slice() : [ refNode ];
			txs = [];
			for ( i = 0, len = refNodes.length; i < len; i++ ) {
				// HACK: Removing and re-inserting nodes to/from the internal list is done because
				// internal list doesn't yet support attribute changes
				refNodes[i].removeFromInternalList();
				txs.push( ve.dm.Transaction.newFromAttributeChanges(
					doc, refNodes[i].getOuterRange().start, attr
				) );
			}
			surfaceModel.change( txs );
			// HACK: Same as above, internal list issues
			for ( i = 0, len = refNodes.length; i < len; i++ ) {
				refNodes[i].addToInternalList();
			}
		}
		// Process the internal node create/edit transaction
		if ( !newItem ) {
			surfaceModel.change(
				ve.dm.Transaction.newFromNodeReplacement( doc, this.internalItem, data )
			);
		} else {
			surfaceModel.change( newItem.transaction );
		}
	}

	// Cleanup
	this.internalItem = null;
	this.referenceSurface.destroy();
	this.referenceToolbar.destroy();
};

/* Registration */

ve.ui.dialogFactory.register( 'mwReferenceEdit', ve.ui.MWReferenceEditDialog );
