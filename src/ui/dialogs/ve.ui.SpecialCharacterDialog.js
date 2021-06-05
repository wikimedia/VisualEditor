/*!
 * VisualEditor UserInterface SpecialCharacterDialog class.
 *
 * @copyright 2011-2020 VisualEditor Team and others; see http://ve.mit-license.org
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

	this.characters = null;
	this.$buttonDomList = null;
	this.categories = null;

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
};

/**
 * @inheritdoc
 */
ve.ui.SpecialCharacterDialog.prototype.getSetupProcess = function ( data ) {
	data = data || {};
	return ve.ui.SpecialCharacterDialog.super.prototype.getSetupProcess.call( this, data )
		.next( function () {
			var inspector = this;

			this.surface = data.surface;
			this.surface.getModel().connect( this, { contextChange: 'onContextChange' } );

			if ( !this.characters ) {
				return ve.init.platform.fetchSpecialCharList()
					.then( function ( specialChars ) {
						inspector.characters = specialChars;
						inspector.buildButtonList();
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
	return ve.ui.SpecialCharacterDialog.super.prototype.getReadyProcess.call( this, data )
		.next( function () {
			// The dialog automatically receives focus after opening, move it back to the surface.
			// (Make sure an existing selection is preserved. Why does focus() reset the selection? 🤦)
			var previousSelection = this.surface.getModel().getSelection();
			this.surface.getView().focus();
			if ( !previousSelection.isNull() ) {
				this.surface.getModel().setSelection( previousSelection );
			}
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
	this.bookletLayout = new OO.ui.BookletLayout( {
		outlined: true,
		continuous: true
	} );
	this.pages = [];
	for ( var category in this.characters ) {
		this.pages.push(
			new ve.ui.SpecialCharacterPage( category, {
				label: this.characters[ category ].label,
				characters: this.characters[ category ].characters,
				attributes: this.characters[ category ].attributes,
				source: this.surface.getMode() === 'source'
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

	this.updateSize();
};

/**
 * Handle the click event on the list
 *
 * @param {jQuery.Event} e Mouse click event
 */
ve.ui.SpecialCharacterDialog.prototype.onListClick = function ( e ) {
	var character = $( e.target ).data( 'character' ),
		fragment = this.surface.getModel().getFragment(),
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
			{ action: 'insert-' + this.bookletLayout.currentPageName }
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
