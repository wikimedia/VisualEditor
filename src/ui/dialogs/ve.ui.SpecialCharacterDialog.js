/*!
 * VisualEditor UserInterface SpecialCharacterDialog class.
 *
 * @copyright See AUTHORS.txt
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
ve.ui.SpecialCharacterDialog = function VeUiSpecialCharacterDialog() {
	// Parent constructor
	ve.ui.SpecialCharacterDialog.super.apply( this, arguments );

	this.characterListLoaded = false;

	this.$element.addClass( 've-ui-specialCharacterDialog' );
};

/* Inheritance */

OO.inheritClass( ve.ui.SpecialCharacterDialog, ve.ui.ToolbarDialog );

/* Static properties */

ve.ui.SpecialCharacterDialog.static.name = 'specialCharacter';

// Invisible title for accessibility
ve.ui.SpecialCharacterDialog.static.title =
	OO.ui.deferMsg( 'visualeditor-specialcharacter-button-tooltip' );

ve.ui.SpecialCharacterDialog.static.size = 'full';

ve.ui.SpecialCharacterDialog.static.padded = false;

ve.ui.SpecialCharacterDialog.static.activeSurface = true;

ve.ui.SpecialCharacterDialog.static.handlesSource = true;

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.SpecialCharacterDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.SpecialCharacterDialog.super.prototype.initialize.call( this );

	// Use 'visualeditor-symbolList-recentlyUsed-specialCharacters' in Hooks.php
	this.characterListLayout = new ve.ui.SymbolListBookletLayout( { preferenceNameSuffix: 'specialCharacters' } );
	this.characterListLayout.connect( this, {
		choose: 'onCharacterListChoose'
	} );

	this.$body.append( this.characterListLayout.$element );
};

/**
 * @inheritdoc
 */
ve.ui.SpecialCharacterDialog.prototype.getSetupProcess = function ( data ) {
	data = data || {};
	return ve.ui.SpecialCharacterDialog.super.prototype.getSetupProcess.call( this, data )
		.next( () => {
			this.surface = data.surface;
			this.surface.getModel().connect( this, { contextChange: 'onContextChange' } );

			this.characterListLayout.$element.toggleClass( 've-ui-specialCharacterDialog-characterList-source', this.surface.getMode() === 'source' );

			if ( !this.characterListLoaded ) {
				this.characterListLoaded = true;

				ve.init.platform.fetchSpecialCharList()
					.then( ( symbolData ) => {
						this.characterListLayout.setSymbolData( symbolData );
						this.updateSize();
					} );
			}
		} );
};

/**
 * @inheritdoc
 */
ve.ui.SpecialCharacterDialog.prototype.getTeardownProcess = function ( data ) {
	data = data || {};
	return ve.ui.SpecialCharacterDialog.super.prototype.getTeardownProcess.call( this, data )
		.first( () => {
			this.surface.getModel().disconnect( this );
			this.surface = null;
		} );
};

/**
 * @inheritdoc
 */
ve.ui.SpecialCharacterDialog.prototype.getActionProcess = function ( action ) {
	return new OO.ui.Process( () => {
		this.close( { action: action } );
	} );
};

/**
 * Handle context change events from the surface model
 */
ve.ui.SpecialCharacterDialog.prototype.onContextChange = function () {
	this.setDisabled( !( this.surface.getModel().getSelection() instanceof ve.dm.LinearSelection ) );
};

/**
 * Handle a character being chosen from the list
 *
 * @param {Object} character Character data
 */
ve.ui.SpecialCharacterDialog.prototype.onCharacterListChoose = function ( character ) {
	const fragment = this.surface.getModel().getFragment(),
		mode = this.surface.getMode();

	function encode( text ) {
		if ( mode === 'visual' && character.entities ) {
			return ve.init.platform.decodeEntities( text );
		} else {
			return text;
		}
	}

	if ( character ) {
		if ( typeof character === 'string' || character.string ) {
			fragment.insertContent( encode( character.string || character ), true ).collapseToEnd().select();
		} else if ( character.action.type === 'replace' ) {
			fragment.insertContent( encode( character.action.options.peri ), true ).collapseToEnd().select();
		} else if ( character.action.type === 'encapsulate' ) {
			fragment.collapseToStart().insertContent( encode( character.action.options.pre ), true );
			fragment.collapseToEnd().insertContent( encode( character.action.options.post ), true ).collapseToEnd().select();
		}

		ve.track(
			'activity.' + this.constructor.static.name,
			{ action: 'insert-' + this.characterListLayout.currentPageName }
		);
	}
};

ve.ui.SpecialCharacterDialog.prototype.getBodyHeight = function () {
	return 150;
};

ve.ui.SpecialCharacterDialog.prototype.getContentHeight = function () {
	// Skip slow complicated measurements that always return 0 for this window
	return this.getBodyHeight();
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.SpecialCharacterDialog );
