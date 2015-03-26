/*!
 * VisualEditor UserInterface SpecialCharacterDialog class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Inspector for inserting special characters.
 *
 * @class
 * @extends ve.ui.ToolbarDialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.SpecialCharacterDialog = function VeUiSpecialCharacterDialog( config ) {
	// Parent constructor
	ve.ui.ToolbarDialog.call( this, config );

	this.characters = null;
	this.$buttonDomList = null;
	this.categories = null;

	this.$element.addClass( 've-ui-specialCharacterDialog' );
};

/* Inheritance */

OO.inheritClass( ve.ui.SpecialCharacterDialog, ve.ui.ToolbarDialog );

/* Static properties */

ve.ui.SpecialCharacterDialog.static.name = 'specialCharacter';

ve.ui.SpecialCharacterDialog.static.title =
	OO.ui.deferMsg( 'visualeditor-specialCharacterDialog-title' );

ve.ui.SpecialCharacterDialog.static.size = 'full';

ve.ui.SpecialCharacterDialog.static.padded = false;

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.SpecialCharacterDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.SpecialCharacterDialog.super.prototype.initialize.call( this );

	this.$spinner = this.$( '<div>' ).addClass( 've-ui-specialCharacterDialog-spinner' );
	this.$content.append( this.$spinner );
};

/**
 * @inheritdoc
 */
ve.ui.SpecialCharacterDialog.prototype.getSetupProcess = function ( data ) {
	return ve.ui.SpecialCharacterDialog.super.prototype.getSetupProcess.call( this, data )
		.next( function () {
			this.surface = data.surface;
			this.surface.getView().focus();
			this.surface.getModel().connect( this, { contextChange: 'onContextChange' } );

			var inspector = this;
			if ( !this.characters ) {
				this.$spinner.show();
				ve.init.platform.fetchSpecialCharList()
					.done( function ( specialChars ) {
						inspector.characters = specialChars;
						inspector.buildButtonList();
					} )
					// TODO: show error message on fetchCharList().fail
					.always( function () {
						// TODO: generalize push/pop pending, like we do in Dialog
						inspector.$spinner.hide();
					} );
			}
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.SpecialCharacterDialog.prototype.getTeardownProcess = function ( data ) {
	data = data || {};
	return ve.ui.SpecialCharacterDialog.super.prototype.getTeardownProcess.call( this, data )
		.first( function () {
			this.surface.getModel().disconnect( this );
			this.surface = null;
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.SpecialCharacterDialog.prototype.getReadyProcess = function ( data ) {
	data = data || {};
	return ve.ui.SpecialCharacterDialog.super.prototype.getReadyProcess.call( this, data )
		.first( function () {
			this.surface.getView().focus();
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.SpecialCharacterDialog.prototype.getActionProcess = function ( action ) {
	return new OO.ui.Process( function () {
		this.close( { action: action } );
	}, this );
};

/**
 * Handle context change events from the surface model
 */
ve.ui.SpecialCharacterDialog.prototype.onContextChange = function () {
	this.setDisabled( !( this.surface.getModel().getSelection() instanceof ve.dm.LinearSelection ) );
};

/**
 * Builds the button DOM list based on the character list
 */
ve.ui.SpecialCharacterDialog.prototype.buildButtonList = function () {
	var category,
		// HACK: When displaying this inside a dialog, menu would tend to be wider than content
		isInsideDialog = !!this.manager.$element.closest( '.oo-ui-dialog' ).length;

	this.bookletLayout = new OO.ui.BookletLayout( {
		$: this.$,
		outlined: true,
		menuSize: isInsideDialog ? '10em' : '18em',
		continuous: true
	} );
	this.pages = [];
	for ( category in this.characters ) {
		this.pages.push(
			new ve.ui.SpecialCharacterPage( category, {
				$: this.$,
				label: category,
				characters: this.characters[category]
			} )
		);
	}
	this.bookletLayout.addPages( this.pages );
	this.bookletLayout.$element.on(
		'click',
		'.ve-ui-specialCharacterPage-character',
		this.onListClick.bind( this )
	);

	this.$body.append( this.bookletLayout.$element );
};

/**
 * Handle the click event on the list
 */
ve.ui.SpecialCharacterDialog.prototype.onListClick = function ( e ) {
	var character = $( e.target ).data( 'character' );
	if ( character ) {
		this.surface.getModel().getFragment().insertContent( character, true ).collapseToEnd().select();
	}
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.SpecialCharacterDialog );
