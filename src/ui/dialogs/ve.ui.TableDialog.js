/*!
 * VisualEditor UserInterface TableDialog class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Dialog for table properties.
 *
 * @class
 * @extends ve.ui.FragmentDialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.TableDialog = function VeUiTableDialog( config ) {
	// Parent constructor
	ve.ui.TableDialog.super.call( this, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.TableDialog, ve.ui.FragmentDialog );

/* Static Properties */

ve.ui.TableDialog.static.name = 'table';

ve.ui.TableDialog.static.size = 'medium';

ve.ui.TableDialog.static.title = OO.ui.deferMsg( 'visualeditor-dialog-table-title' );

ve.ui.TableDialog.static.actions = [
	{
		action: 'done',
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-done' ),
		flags: [ 'primary', 'progressive' ]
	},
	{
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-cancel' ),
		flags: [ 'safe', 'back' ]
	}
];

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.TableDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.TableDialog.super.prototype.initialize.call( this );

	this.initialValues = null;

	this.panel = new OO.ui.PanelLayout( {
		padded: true,
		expanded: false
	} );

	this.captionToggle = new OO.ui.ToggleSwitchWidget();
	this.captionField = new OO.ui.FieldLayout( this.captionToggle, {
		align: 'left',
		label: ve.msg( 'visualeditor-dialog-table-caption' )
	} );

	this.captionToggle.connect( this, { change: 'updateActions' } );

	this.panel.$element.append( this.captionField.$element );

	this.$body.append( this.panel.$element );
};

/**
 * Update the 'done' action according to whether there are changes
 */
ve.ui.TableDialog.prototype.updateActions = function () {
	this.actions.setAbilities( { done: !ve.compare( this.getValues(), this.initialValues ) } );
};

/**
 * Get object describing current form values.
 *
 * To be compared against this.initialValues
 *
 * @return {Object} Current form values
 */
ve.ui.TableDialog.prototype.getValues = function () {
	return {
		caption: this.captionToggle.getValue()
	};
};

/**
 * @inheritdoc
 */
ve.ui.TableDialog.prototype.getSetupProcess = function ( data ) {
	return ve.ui.TableDialog.super.prototype.getSetupProcess.call( this, data )
		.next( function () {
			this.initialValues = {
				caption: !!this.getFragment().getSelection().getTableNode().getCaptionNode()
			};
			this.captionToggle.setValue( this.initialValues.caption );
			this.closingFragment = null;
			this.updateActions();
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.TableDialog.prototype.getActionProcess = function ( action ) {
	return ve.ui.TableDialog.super.prototype.getActionProcess.call( this, action )
		.next( function () {
			var fragment, surfaceModel, selection, captionNode;

			if ( action === 'done' ) {
				surfaceModel = this.getFragment().getSurface();
				selection = surfaceModel.getSelection();
				captionNode = this.getFragment().getSelection().getTableNode().getCaptionNode();
				if ( this.captionToggle.getValue() !== this.initialValues.caption ) {
					if ( this.initialValues.caption ) {
						fragment = surfaceModel.getLinearFragment( captionNode.getOuterRange(), true );
						fragment.removeContent();
					} else {
						fragment = surfaceModel.getLinearFragment( new ve.Range( selection.tableRange.start + 1 ), true );

						fragment.insertContent( [
							{ type: 'tableCaption' },
							{ type: 'paragraph', internal: { generated: 'wrapper' } },
							{ type: '/paragraph' },
							{ type: '/tableCaption' }
						], false );
						// Don't change this.fragment immediately, wait until teardown process, as child
						// dialogs my want access to the original fragment
						this.closingFragment = fragment.collapseToStart().adjustLinearSelection( 2, 2 );
					}
				}
				this.close( { action: 'done' } );
			}
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.TableDialog.prototype.getTeardownProcess = function ( action ) {
	return ve.ui.TableDialog.super.prototype.getTeardownProcess.call( this, action )
		.first( function () {
			this.fragment = this.closingFragment || this.fragment;
		}, this );
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.TableDialog );
