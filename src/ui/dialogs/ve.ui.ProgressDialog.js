/*!
 * VisualEditor UserInterface ProgressDialog class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Dialog for showing operations in progress.
 *
 * @class
 * @extends OO.ui.MessageDialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.ProgressDialog = function VeUiProgressDialog( config ) {
	// Parent constructor
	ve.ui.ProgressDialog.super.call( this, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.ProgressDialog, OO.ui.MessageDialog );

/* Static Properties */

ve.ui.ProgressDialog.static.name = 'progress';

ve.ui.ProgressDialog.static.size = 'medium';

ve.ui.ProgressDialog.static.actions = [
	{
		action: 'cancel',
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-cancel' ),
		flags: 'destructive',
		modes: 'cancellable'
	}
];

// Individual progress items can be cancellable, but the whole
// dialog should not be escapable.
ve.ui.ProgressDialog.prototype.getEscapeAction = function () {
	return null;
};

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.ProgressDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.ProgressDialog.super.prototype.initialize.call( this );

	// Properties
	this.inProgress = 0;
	this.cancelDeferreds = [];
};

/**
 * @inheritdoc
 */
ve.ui.ProgressDialog.prototype.getSetupProcess = function ( data ) {
	data = data || {};

	// Parent method
	return ve.ui.ProgressDialog.super.prototype.getSetupProcess.call( this, data )
		.next( () => {
			const progresses = data.progresses;

			let cancellable = false;
			this.inProgress = progresses.length;
			this.text.$element.empty();
			this.cancelDeferreds = [];

			progresses.forEach( ( progress ) => {
				const cancelDeferred = ve.createDeferred();
				const $row = $( '<div>' ).addClass( 've-ui-progressDialog-row' );
				const progressBar = new OO.ui.ProgressBarWidget();
				const fieldLayout = new OO.ui.FieldLayout(
					progressBar,
					{
						label: progress.label,
						align: 'top'
					}
				);

				$row.append( fieldLayout.$element );

				if ( progress.cancellable ) {
					const cancelButton = new OO.ui.ButtonWidget( {
						framed: false,
						icon: 'cancel',
						title: OO.ui.deferMsg( 'visualeditor-dialog-action-cancel' )
					} ).on( 'click', cancelDeferred.reject.bind( cancelDeferred ) );
					$row.append( cancelButton.$element );
					cancellable = true;
				}

				this.text.$element.append( $row );
				progress.progressBarDeferred.resolve( progressBar, cancelDeferred.promise() );
				progress.progressCompletePromise.then(
					this.progressComplete.bind( this, $row, false ),
					this.progressComplete.bind( this, $row, true )
				);
				this.cancelDeferreds.push( cancelDeferred );
			} );
			this.actions.setMode( cancellable ? 'cancellable' : 'default' );
		} );
};

/**
 * @inheritdoc
 */
ve.ui.ProgressDialog.prototype.getActionProcess = function ( action ) {
	return new OO.ui.Process( () => {
		if ( action === 'cancel' ) {
			this.cancelDeferreds.forEach( ( cancelDeferred ) => cancelDeferred.reject() );
		}
		this.close( { action: action } );
	} );
};

/**
 * Progress has completed for an item
 *
 * @param {jQuery} $row Row containing progress bar which has completed
 * @param {boolean} failed The item failed
 */
ve.ui.ProgressDialog.prototype.progressComplete = function ( $row, failed ) {
	this.inProgress--;
	if ( !this.inProgress ) {
		this.close();
	}
	if ( failed ) {
		$row.remove();
		this.updateSize();
	}
};

/* Static methods */

/* Registration */

ve.ui.windowFactory.register( ve.ui.ProgressDialog );
