/*!
 * VisualEditor user interface ReferenceInsertDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

/**
 * @class
 * @abstract
 * @extends ve.ui.Dialog
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Config options
 */
ve.ui.MWReferenceInsertDialog = function VeUiMWReferenceInsertDialog( surface, config ) {
	// Parent constructor
	ve.ui.Dialog.call( this, surface, config );

	// Properties
	this.result = null;
};

/* Inheritance */

ve.inheritClass( ve.ui.MWReferenceInsertDialog, ve.ui.Dialog );

/* Static Properties */

ve.ui.MWReferenceInsertDialog.static.titleMessage = 'visualeditor-dialog-reference-insert-title';

ve.ui.MWReferenceInsertDialog.static.icon = 'reference';

/* Methods */

/**
 * Handle result select events.
 *
 * @method
 * @param {string|Object|null} result Command string, reference attributes object, or null if
 *   nothing is selected
 */
ve.ui.MWReferenceInsertDialog.prototype.onSelect = function ( result ) {
	this.result = result;
	this.applyButton.setDisabled( result === null );
};

ve.ui.MWReferenceInsertDialog.prototype.onOpen = function () {
	// Parent method
	ve.ui.Dialog.prototype.onOpen.call( this );

	// Initialization
	this.search.buildIndex();
	this.search.getQuery().$input.focus().select();
};

ve.ui.MWReferenceInsertDialog.prototype.onClose = function ( action ) {
	var doc, item, attr, internalList, group, refNode,
		create = this.result === 'create',
		surface = this.surface,
		surfaceModel = surface.getModel();

	// Parent method
	ve.ui.Dialog.prototype.onClose.call( this );

	if ( action === 'apply' ) {
		doc = surfaceModel.getDocument(),
		internalList = doc.getInternalList();
		if ( create ) {
			// Create new reference
			attr = {
				'listKey': null,
				'refGroup': '',
				'listGroup': 'mwReference/'
			};
			item = internalList.getItemInsertion(
				attr.listGroup,
				attr.listKey,
				[ { 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } } ]
					.concat( ve.splitClusters( this.search.getQuery().getValue() ) )
					.concat( [ { 'type': '/paragraph' } ] )
			);
			surfaceModel.change( item.transaction );
			attr.listIndex = item.index;
		} else if ( ve.isPlainObject( this.result ) ) {
			// Re-use existing reference
			attr = {
				'listKey': this.result.listKey,
				'refGroup': this.result.refGroup,
				'listGroup': this.result.listGroup,
				'listIndex': this.result.listIndex
			};
			if ( attr.listKey === null ) {
				attr.listKey = internalList.getUniqueListKey( attr.listGroup );
				// Update the list key in the other use of this source
				group = internalList.nodes[attr.listGroup];
				refNode = group.firstNodes[attr.listIndex];
				// HACK: Removing and re-inserting nodes to/from the internal list is done because
				// internal list doesn't yet support attribute changes
				refNode.removeFromInternalList();
				surfaceModel.change(
					ve.dm.Transaction.newFromAttributeChanges(
						doc, refNode.getOuterRange().start, { 'listKey': attr.listKey }
					)
				);
				refNode.addToInternalList();
			}
		} else {
			throw new Error( 'Invalid selection' );
		}
		// Add reference at cursor
		surfaceModel.getFragment().collapseRangeToEnd().insertContent( [
			{ 'type': 'mwReference', 'attributes': attr }, { 'type': '/mwReference' }
		] );
		// Auto-launch the reference editor if we are creating a new reference
		if ( create ) {
			setTimeout( function () {
				surface.getDialogs().open( 'mwReferenceEdit' );
			} );
		}
	}
};

ve.ui.MWReferenceInsertDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.Dialog.prototype.initialize.call( this );

	// Properties
	this.search = new ve.ui.MWReferenceSearchWidget( this.surface, { '$$': this.frame.$$ } );

	// Events
	this.search.connect( this, { 'select': 'onSelect' } );

	// Initialization
	this.applyButton.setDisabled( true ).setLabel(
		mw.msg( 'visualeditor-dialog-reference-insert-button' )
	);
	this.search.$.addClass( 've-ui-mwReferenceInsertDialog-select' );
	this.$body.append( this.search.$ );
};

/* Registration */

ve.ui.dialogFactory.register( 'mwReferenceInsert', ve.ui.MWReferenceInsertDialog );
