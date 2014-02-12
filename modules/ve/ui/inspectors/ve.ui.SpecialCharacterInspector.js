/*!
 * VisualEditor UserInterface SpecialCharacterInspector class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Special character inspector.
 *
 * @class
 * @extends ve.ui.Inspector
 *
 * @constructor
 * @param {ve.ui.WindowSet} windowSet Window set this inspector is part of
 * @param {Object} [config] Configuration options
 */
ve.ui.SpecialCharacterInspector = function VeUiSpecialCharacterInspector( windowSet, config ) {

	// Parent constructor
	ve.ui.Inspector.call( this, windowSet, config );

	this.characters = null;
	this.$buttonDomList = null;
	this.initialSelection = null;
	this.addedChar = null;
	this.categories = null;

	// Fallback character list in case no list is found anywhere
	this.minimalCharacterList =
	{
		'accents': {
			'à': 'à',
			'á': 'á',
			'â': 'â',
			'ä': 'ä',
			'ç': 'ç',
			'è': 'è',
			'é': 'é',
			'ê': 'ê',
			'ë': 'ë',
			'ì': 'ì',
			'í': 'í',
			'î': 'î',
			'ï': 'ï',
			'ò': 'ò',
			'ó': 'ó',
			'ô': 'ô',
			'ö': 'ö',
			'ø': 'ø',
			'ù': 'ù',
			'ú': 'ú',
			'û': 'û',
			'ü': 'ü'
		},
		'symbols': {
			'−': '−',
			'—': '—',
			'°': '°',
			'″': '″',
			'′': '′',
			'←': '←',
			'→': '→',
			'·': '·',
			'§': '§'
		}
	};
};

/* Inheritance */

OO.inheritClass( ve.ui.SpecialCharacterInspector, ve.ui.Inspector );

/* Static properties */

ve.ui.SpecialCharacterInspector.static.name = 'specialcharacter';

ve.ui.SpecialCharacterInspector.static.icon = 'specialcharacter';

ve.ui.SpecialCharacterInspector.static.title =
	OO.ui.deferMsg( 'visualeditor-specialcharacterinspector-title' );

ve.ui.SpecialCharacterInspector.static.removable = false;

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.SpecialCharacterInspector.prototype.initialize = function () {
	// Parent method
	ve.ui.Inspector.prototype.initialize.call( this );

	this.$spinner = this.$( '<div>' ).addClass( 've-specialchar-spinner' );
	this.$form.append( this.$spinner );
};

/**
 * Handle the inspector being setup.
 *
 * @method
 * @param {Object} [data] Inspector opening data
 */
ve.ui.SpecialCharacterInspector.prototype.setup = function ( data ) {
	// Parent method
	ve.ui.Inspector.prototype.setup.call( this, data );

	// Preserve initial selection so we can collapse cursor position
	// after we're done adding
	this.initialSelection = this.surface.getModel().getSelection();

	this.getCharList().done( ve.bind( function () {
		// Now we can rebuild our button list
		// We only want to rebuild the list if we don't already have it
		if ( !this.$buttonDomList ) {
			// Start with the spinner showing
			this.$spinner.show();
			this.buildButtonList().done( ve.bind( function () {
				// Append the new button list
				this.$form.append( this.$buttonDomList );
				// Done, hide the spinner
				this.$spinner.hide();

			}, this ) );
		}
	}, this ) );

};

/**
 * Get the special character list object
 * This can also be an AJAX call with default fallback
 *
 * @returns {jQuery.Promise}
 */
ve.ui.SpecialCharacterInspector.prototype.getCharList = function () {
	var charslist, charobj,
		deferred = $.Deferred();

	// Don't request the character list again if we already have it
	if ( !this.characters ) {

		// Get the character list
		charslist = ve.msg( 'visualeditor-specialcharinspector-characterlist-insert' );
		try {
			charobj = $.parseJSON( charslist );
		} catch ( err ) {
			// There was no character list found, or the character list message is
			// invalid json string. Force a fallback to the minimal character list
			charobj = this.minimalCharacterList;
			ve.log( 've.ui.SpecialCharacterInspector: Could not parse the Special Character list; using default.');
			ve.log( err.message );
		} finally {
			this.characters = charobj;
			deferred.resolve();
		}
	}

	return deferred.promise();
};

/**
 * Builds the button DOM list based on the character list
 *
 * @returns {jQuery.Promise}
 */
ve.ui.SpecialCharacterInspector.prototype.buildButtonList = function () {
	var category, categoryButtons,
		deferred = $.Deferred(),
		$widgetOutput = this.$( '<div>' ).addClass( 've-specialchar-list' );

	if ( !this.characters ) {
		deferred.reject();
	}

	for ( category in this.characters ) {
		categoryButtons = new ve.ui.GroupButtonWidget( {
			'groupName': category,
			'group': this.characters[category],
			'aggregations': { 'click': 'click' }
		} );

		categoryButtons.connect( this, { 'click': 'onSpecialCharAdd' } );

		$widgetOutput
			.append( this.$( '<h2>').text( category ) )
			.append( categoryButtons.$element );
	}

	this.$buttonDomList = $widgetOutput;
	deferred.resolve();
	return deferred.promise();
};

/**
 * Handle the click event on the button groups. The value of the selection will be inserted
 * into the text
 *
 * @param {OO.ui.ButtonWidget} button The value attached to the clicked button
 */
ve.ui.SpecialCharacterInspector.prototype.onSpecialCharAdd = function ( button ) {
	var fragment = this.surface.getModel().getFragment( null, true ),
		value = button.returnValue;

	// Insert the character
	if ( value !== undefined ) {
		// get the insertion value (it could be in any category)
		this.addedChar = value;
		fragment.insertContent( value, false );
	}
};

/**
 * @inheritdoc
 */
ve.ui.SpecialCharacterInspector.prototype.teardown = function ( data ) {
	var selection;
	// Collapse selection after the inserted content
	if ( this.addedChar ) {
		selection = new ve.Range( this.initialSelection.start + this.addedChar.length );
		this.surface.execute( 'content', 'select', selection );
	}
	// reset
	this.addedChar = null;
	// Parent method
	ve.ui.Inspector.prototype.teardown.call( this, data );
};

/* Registration */

ve.ui.inspectorFactory.register( ve.ui.SpecialCharacterInspector );
