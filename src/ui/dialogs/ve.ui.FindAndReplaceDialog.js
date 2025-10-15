/*!
 * VisualEditor UserInterface FindAndReplaceDialog class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Find and replace dialog.
 *
 * @class
 * @extends ve.ui.ToolbarDialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.FindAndReplaceDialog = function VeUiFindAndReplaceDialog( config = {} ) {
	// Parent constructor
	ve.ui.FindAndReplaceDialog.super.call( this, config );

	// Pre-initialization
	this.$element.addClass( 've-ui-findAndReplaceDialog' );
};

/* Inheritance */

OO.inheritClass( ve.ui.FindAndReplaceDialog, ve.ui.ToolbarDialog );

ve.ui.FindAndReplaceDialog.static.name = 'findAndReplace';

// Invisible title for accessibility
ve.ui.FindAndReplaceDialog.static.title =
	OO.ui.deferMsg( 'visualeditor-find-and-replace-title' );

ve.ui.FindAndReplaceDialog.static.handlesSource = true;

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.FindAndReplaceDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.FindAndReplaceDialog.super.prototype.initialize.call( this );

	// Properties
	this.surface = null;
	this.invalidRegex = false;
	this.initialFragment = null;
	this.startOffset = 0;
	this.fragments = [];
	this.results = 0;
	this.replacing = false;
	this.focusedIndex = 0;
	this.query = null;
	this.findText = new OO.ui.TextInputWidget( {
		placeholder: ve.msg( 'visualeditor-find-and-replace-find-text' ),
		value: ve.userConfig( 'visualeditor-findAndReplace-findText' ),
		validate: () => !this.invalidRegex,
		tabIndex: 1
	} );
	this.findText.$input.attr( 'aria-label', ve.msg( 'visualeditor-find-and-replace-find-text' ) );
	this.updateUserConfigDebounced = ve.debounce( this.updateUserConfig.bind( this ), 500 );

	this.previousButton = new OO.ui.ButtonWidget( {
		icon: 'previous',
		title: ve.msg( 'visualeditor-find-and-replace-previous-button' ) + ' ' +
			ve.ui.triggerRegistry.getMessages( 'findPrevious' ).join( ', ' ),
		tabIndex: 2
	} );
	this.nextButton = new OO.ui.ButtonWidget( {
		icon: 'next',
		title: ve.msg( 'visualeditor-find-and-replace-next-button' ) + ' ' +
			ve.ui.triggerRegistry.getMessages( 'findNext' ).join( ', ' ),
		tabIndex: 2
	} );
	this.matchCaseToggle = new OO.ui.ToggleButtonWidget( {
		icon: 'searchCaseSensitive',
		title: ve.msg( 'visualeditor-find-and-replace-match-case' ),
		value: ve.userConfig( 'visualeditor-findAndReplace-matchCase' ),
		tabIndex: 2
	} );
	this.regexToggle = new OO.ui.ToggleButtonWidget( {
		icon: 'searchRegularExpression',
		title: ve.msg( 'visualeditor-find-and-replace-regular-expression' ),
		value: ve.userConfig( 'visualeditor-findAndReplace-regex' ),
		tabIndex: 2
	} );
	this.wordToggle = new OO.ui.ToggleButtonWidget( {
		icon: 'quotes',
		title: ve.msg( 'visualeditor-find-and-replace-word' ),
		value: ve.userConfig( 'visualeditor-findAndReplace-word' ),
		tabIndex: 2
	} );
	this.diacriticToggle = new OO.ui.ToggleButtonWidget( {
		icon: 'searchDiacritics',
		title: ve.msg( 'visualeditor-find-and-replace-diacritic' ),
		value: ve.userConfig( 'visualeditor-findAndReplace-diacritic' ),
		tabIndex: 2
	} );

	this.replaceText = new OO.ui.TextInputWidget( {
		placeholder: ve.msg( 'visualeditor-find-and-replace-replace-text' ),
		value: ve.userConfig( 'visualeditor-findAndReplace-replaceText' ),
		tabIndex: 1
	} );
	this.replaceText.$input.attr( 'aria-label', ve.msg( 'visualeditor-find-and-replace-replace-text' ) );

	this.replaceButton = new OO.ui.ButtonWidget( {
		label: ve.msg( 'visualeditor-find-and-replace-replace-button' ),
		tabIndex: 1
	} );
	this.replaceAllButton = new OO.ui.ButtonWidget( {
		label: ve.msg( 'visualeditor-find-and-replace-replace-all-button' ),
		tabIndex: 1
	} );
	const doneButton = new OO.ui.ButtonWidget( {
		classes: [ 've-ui-findAndReplaceDialog-cell' ],
		label: ve.msg( 'visualeditor-find-and-replace-done' ),
		tabIndex: 1
	} );

	const optionsGroup = new OO.ui.ButtonGroupWidget( {
		classes: [ 've-ui-findAndReplaceDialog-cell' ],
		items: [
			this.matchCaseToggle,
			this.regexToggle,
			this.wordToggle,
			this.diacriticToggle
		]
	} );
	const navigateGroup = new OO.ui.ButtonGroupWidget( {
		classes: [ 've-ui-findAndReplaceDialog-cell' ],
		items: [
			this.previousButton,
			this.nextButton
		]
	} );
	const replaceGroup = new OO.ui.ButtonGroupWidget( {
		classes: [ 've-ui-findAndReplaceDialog-cell' ],
		items: [
			this.replaceButton,
			this.replaceAllButton
		]
	} );
	const $findRow = $( '<div>' ).addClass( 've-ui-findAndReplaceDialog-row' );
	const $replaceRow = $( '<div>' ).addClass( 've-ui-findAndReplaceDialog-row' );

	// Events
	this.updateFragmentsThrottled = ve.throttle( this.updateFragments.bind( this ), 250 );
	this.findText.connect( this, {
		change: 'onFindChange',
		enter: 'onFindReplaceTextEnter'
	} );
	this.replaceText.connect( this, {
		change: 'onReplaceChange',
		enter: 'onFindReplaceTextEnter'
	} );
	this.matchCaseToggle.connect( this, { change: 'onFindChange' } );
	this.regexToggle.connect( this, { change: 'onFindChange' } );
	this.wordToggle.connect( this, { change: 'onFindChange' } );
	this.diacriticToggle.connect( this, { change: 'onFindChange' } );
	this.nextButton.connect( this, { click: 'findNext' } );
	this.previousButton.connect( this, { click: 'findPrevious' } );
	this.replaceButton.connect( this, { click: 'onReplaceButtonClick' } );
	this.replaceAllButton.connect( this, { click: 'onReplaceAllButtonClick' } );
	doneButton.connect( this, { click: 'close' } );

	this.tabIndexScope = new ve.ui.TabIndexScope( {
		root: this.$content,
		wrapAround: true
	} );

	// Initialization
	this.$content.addClass( 've-ui-findAndReplaceDialog-content' );
	this.$body
		.append(
			$findRow.append(
				$( '<div>' ).addClass( 've-ui-findAndReplaceDialog-cell ve-ui-findAndReplaceDialog-cell-input' ).append(
					this.findText.$element
				),
				navigateGroup.$element,
				optionsGroup.$element
			),
			$replaceRow.append(
				$( '<div>' ).addClass( 've-ui-findAndReplaceDialog-cell ve-ui-findAndReplaceDialog-cell-input' ).append(
					this.replaceText.$element
				),
				replaceGroup.$element,
				doneButton.$element
			)
		);
};

/**
 * @inheritdoc
 */
ve.ui.FindAndReplaceDialog.prototype.getSetupProcess = function ( data = {} ) {
	return ve.ui.FindAndReplaceDialog.super.prototype.getSetupProcess.call( this, data )
		.first( () => {
			this.surface = data.surface;

			// Events
			this.surface.getView().connect( this, { position: 'onSurfaceModelDocumentUpdate' } );

			this.updateFragments();
		} );
};

/**
 * @inheritdoc
 */
ve.ui.FindAndReplaceDialog.prototype.getReadyProcess = function ( data ) {
	return ve.ui.FindAndReplaceDialog.super.prototype.getReadyProcess.call( this, data )
		.next( () => {
			this.focus();
		} );
};

/**
 * @inheritdoc
 */
ve.ui.FindAndReplaceDialog.prototype.getTeardownProcess = function ( data ) {
	return ve.ui.FindAndReplaceDialog.super.prototype.getTeardownProcess.call( this, data )
		.next( () => {
			const surfaceView = this.surface.getView(),
				surfaceModel = this.surface.getModel();

			// Events
			surfaceView.disconnect( this );

			let selection;
			if ( this.fragments.length ) {
				// Either the active search result…
				selection = this.fragments[ this.focusedIndex ].getSelection();
			} else {
				// … or the initial selection
				selection = this.initialFragment.getSelection();
			}
			surfaceModel.setSelection( selection );

			// Generates ve-ce-surface-selections-findResults CSS class
			surfaceView.getSelectionManager().drawSelections( 'findResults', [] );
			// Generates ve-ce-surface-selections-findResultFocused CSS class
			surfaceView.getSelectionManager().drawSelections( 'findResultFocused', [] );
			this.fragments = [];
			this.surface = null;
			this.focusedIndex = 0;
		} );
};

/**
 * Handle documentUpdate events from the surface model
 */
ve.ui.FindAndReplaceDialog.prototype.onSurfaceModelDocumentUpdate = function () {
	if ( this.replacing ) {
		return;
	}
	this.updateFragmentsThrottled();
};

/**
 * Handle change events to the find inputs (text or match case)
 */
ve.ui.FindAndReplaceDialog.prototype.onFindChange = function () {
	this.updateFragments();
	this.highlightFocused( true );
	this.diacriticToggle.setDisabled( this.regexToggle.getValue() );
	this.updateUserConfigDebounced();
};

/**
 * Handle change events to the replace input
 */
ve.ui.FindAndReplaceDialog.prototype.onReplaceChange = function () {
	this.updateUserConfigDebounced();
};

/**
 * Remember inputs in the dialog in user config.
 */
ve.ui.FindAndReplaceDialog.prototype.updateUserConfig = function () {
	ve.userConfig( {
		'visualeditor-findAndReplace-findText': this.findText.getValue(),
		'visualeditor-findAndReplace-matchCase': this.matchCaseToggle.getValue(),
		'visualeditor-findAndReplace-regex': this.regexToggle.getValue(),
		'visualeditor-findAndReplace-word': this.wordToggle.getValue(),
		'visualeditor-findAndReplace-diacritic': this.diacriticToggle.getValue(),
		'visualeditor-findAndReplace-replaceText': this.replaceText.getValue()
	} );
};

/**
 * Handle enter events on the find text and replace text inputs
 *
 * @param {jQuery.Event} e
 */
ve.ui.FindAndReplaceDialog.prototype.onFindReplaceTextEnter = function ( e ) {
	if ( !this.results ) {
		return;
	}
	if ( e.shiftKey ) {
		this.findPrevious();
	} else {
		this.findNext();
	}
};

/**
 * Update search result fragments
 *
 * @param {boolean} [noRender] Don't render the fragments after updating
 */
ve.ui.FindAndReplaceDialog.prototype.updateFragments = function ( noRender ) {
	const surfaceModel = this.surface.getModel(),
		documentModel = surfaceModel.getDocument(),
		isReadOnly = surfaceModel.isReadOnly(),
		matchCase = this.matchCaseToggle.getValue(),
		isRegex = this.regexToggle.getValue(),
		wholeWord = this.wordToggle.getValue(),
		diacriticInsensitive = this.diacriticToggle.getValue(),
		find = this.findText.getValue();
	let ranges = [];

	this.invalidRegex = false;

	if ( isRegex && find ) {
		try {

			this.query = new RegExp( find, matchCase ? 'g' : 'gi' );
		} catch ( e ) {
			this.invalidRegex = true;
			this.query = '';
		}
	} else {
		this.query = find;
	}
	this.findText.setValidityFlag();

	this.fragments = [];
	let startIndex;
	if ( this.query ) {
		ranges = documentModel.findText( this.query, {
			caseSensitiveString: matchCase,
			diacriticInsensitiveString: diacriticInsensitive,
			noOverlaps: true,
			wholeWord: wholeWord
		} );
		ranges.forEach( ( range ) => {
			this.fragments.push( surfaceModel.getLinearFragment( range, true, true ) );
			if ( startIndex === undefined && range.start >= this.startOffset ) {
				startIndex = this.fragments.length - 1;
			}
		} );
	}
	this.results = this.fragments.length;
	this.focusedIndex = startIndex || 0;
	this.nextButton.setDisabled( !this.results );
	this.previousButton.setDisabled( !this.results );
	this.replaceText.setDisabled( isReadOnly );
	this.replaceButton.setDisabled( !this.results || isReadOnly );
	this.replaceAllButton.setDisabled( !this.results || isReadOnly );

	if ( !noRender ) {
		this.renderFragments();
	}
};

/**
 * Position results markers
 */
ve.ui.FindAndReplaceDialog.prototype.renderFragments = function () {
	const surfaceView = this.surface.getView();
	const selections = this.fragments.map( ( fragment ) => surfaceView.getSelection( fragment.getSelection() ) );
	// Generates ve-ce-surface-selections-findResults CSS class
	surfaceView.getSelectionManager().drawSelections( 'findResults', selections );
	this.highlightFocused();
};

/**
 * Highlight the focused result marker
 *
 * @param {boolean} scrollIntoView Scroll the marker into view
 */
ve.ui.FindAndReplaceDialog.prototype.highlightFocused = function ( scrollIntoView ) {
	const surfaceView = this.surface.getView();

	if ( this.results ) {
		this.findText.setLabel(
			ve.msg( 'visualeditor-find-and-replace-results',
				ve.init.platform.formatNumber( this.focusedIndex + 1 ),
				ve.init.platform.formatNumber( this.results )
			)
		);
	} else {
		this.findText.setLabel(
			this.invalidRegex ? ve.msg( 'visualeditor-find-and-replace-invalid-regex' ) : ''
		);
		surfaceView.getSelectionManager().drawSelections( 'findResultFocused', [] );
		return;
	}

	const selection = this.fragments[ this.focusedIndex ].getSelection();
	this.startOffset = selection.getCoveringRange().start;

	surfaceView.getSelectionManager().drawSelections( 'findResultFocused', [ surfaceView.getSelection( selection ) ] );

	if ( scrollIntoView ) {
		surfaceView.getSurface().scrollSelectionIntoView( selection, { animate: true } );
	}
};

/**
 * Focus the dialog
 */
ve.ui.FindAndReplaceDialog.prototype.focus = function () {
	this.findText.focus().select();
};

/**
 * Find the selected text on opening
 */
ve.ui.FindAndReplaceDialog.prototype.findSelected = function () {
	const fragment = this.surface.getModel().getFragment( null, true );

	this.initialFragment = fragment;
	this.startOffset = ve.getProp( this.initialFragment.getSelection().getRanges(
		this.initialFragment.getDocument()
	), 0, 'start' ) || 0;

	const text = fragment.getText();
	if ( text && text !== this.findText.getValue() ) {
		this.findText.setValue( text );
	}

	this.focus();
};

/**
 * Find the next result
 */
ve.ui.FindAndReplaceDialog.prototype.findNext = function () {
	this.focusedIndex = ( this.focusedIndex + 1 ) % this.results;
	this.highlightFocused( true );
};

/**
 * Find the previous result
 */
ve.ui.FindAndReplaceDialog.prototype.findPrevious = function () {
	this.focusedIndex = ( this.focusedIndex + this.results - 1 ) % this.results;
	this.highlightFocused( true );
};

/**
 * Handle click events on the replace button
 */
ve.ui.FindAndReplaceDialog.prototype.onReplaceButtonClick = function () {
	if ( !this.results ) {
		return;
	}

	this.replace( this.focusedIndex );

	// Find the next fragment after this one ends. Ensures that if we replace
	// 'foo' with 'foofoo' we don't select the just-inserted text.
	const end = this.fragments[ this.focusedIndex ].getSelection().getRange().end;

	this.updateFragments( true );

	while ( this.fragments[ this.focusedIndex ] && this.fragments[ this.focusedIndex ].getSelection().getRange().end <= end ) {
		this.focusedIndex++;
	}
	// We may have iterated off the end, or run out of results
	this.focusedIndex = this.results ? this.focusedIndex % this.results : 0;

	this.renderFragments();

	// Wherever we end up, scroll to whatever we've got focused
	this.highlightFocused( true );
};

/**
 * Handle click events on the previous all button
 */
ve.ui.FindAndReplaceDialog.prototype.onReplaceAllButtonClick = function () {
	const surfaceView = this.surface.getView(),
		wasActivated = !surfaceView.isDeactivated();

	if ( wasActivated ) {
		surfaceView.deactivate();
	}
	for ( let i = 0, l = this.results; i < l; i++ ) {
		this.replace( i );
	}
	if ( wasActivated ) {
		surfaceView.activate();
	}

	this.updateFragments();
};

/**
 * Replace the result at a specified index
 *
 * @param {number} index Index to replace
 */
ve.ui.FindAndReplaceDialog.prototype.replace = function ( index ) {
	const replace = this.replaceText.getValue();

	// Prevent replace from triggering throttled redraws
	this.replacing = true;

	if ( this.query instanceof RegExp ) {
		this.fragments[ index ].insertContent(
			this.fragments[ index ].getText().replace( this.query, replace ),
			true
		);
	} else {
		this.fragments[ index ].insertContent( replace, true );
	}

	// 'position' event is deferred, so block that too
	setTimeout( () => {
		this.replacing = false;
	} );
};

/**
 * @inheritdoc
 */
ve.ui.FindAndReplaceDialog.prototype.getActionProcess = function ( action ) {
	if ( action === 'findSelected' || action === 'findNext' || action === 'findPrevious' ) {
		return new OO.ui.Process( this[ action ], this );
	}
	return ve.ui.FindAndReplaceDialog.super.prototype.getActionProcess.call( this, action );
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.FindAndReplaceDialog );
