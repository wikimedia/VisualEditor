/*!
 * VisualEditor UserInterface FindAndReplaceDialog class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
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
ve.ui.FindAndReplaceDialog = function VeUiFindAndReplaceDialog( config ) {
	// Parent constructor
	ve.ui.FindAndReplaceDialog.super.call( this, config );

	// Pre-initialization
	this.$element.addClass( 've-ui-findAndReplaceDialog' );
};

/* Inheritance */

OO.inheritClass( ve.ui.FindAndReplaceDialog, ve.ui.ToolbarDialog );

ve.ui.FindAndReplaceDialog.static.name = 'findAndReplace';

/**
 * Maximum number of results to render
 *
 * @property {number}
 */
ve.ui.FindAndReplaceDialog.static.maxRenderedResults = 100;

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.FindAndReplaceDialog.prototype.initialize = function () {
	var optionsGroup, navigateGroup, replaceGroup, doneButton, $findRow, $replaceRow;

	// Parent method
	ve.ui.FindAndReplaceDialog.super.prototype.initialize.call( this );

	// Properties
	this.surface = null;
	this.invalidRegex = false;
	this.$findResults = $( '<div>' ).addClass( 've-ui-findAndReplaceDialog-findResults' );
	this.initialFragment = null;
	this.startOffset = 0;
	this.fragments = [];
	this.results = 0;
	this.renderedResultsCache = {};
	// Range over the list of fragments indicating which ones where rendered,
	// e.g. [1,3] means fragments 1 & 2 were rendered
	this.renderedFragments = new ve.Range();
	this.replacing = false;
	this.focusedIndex = 0;
	this.query = null;
	this.findText = new OO.ui.TextInputWidget( {
		placeholder: ve.msg( 'visualeditor-find-and-replace-find-text' ),
		value: ve.userConfig( 'visualeditor-findAndReplace-findText' ),
		validate: ( function ( dialog ) {
			return function () {
				return !dialog.invalidRegex;
			};
		} )( this )
	} );
	this.matchCaseToggle = new OO.ui.ToggleButtonWidget( {
		icon: 'searchCaseSensitive',
		iconTitle: ve.msg( 'visualeditor-find-and-replace-match-case' ),
		value: ve.userConfig( 'visualeditor-findAndReplace-matchCase' )
	} );
	this.regexToggle = new OO.ui.ToggleButtonWidget( {
		icon: 'searchRegularExpression',
		iconTitle: ve.msg( 'visualeditor-find-and-replace-regular-expression' ),
		value: ve.userConfig( 'visualeditor-findAndReplace-regex' )
	} );
	this.wordToggle = new OO.ui.ToggleButtonWidget( {
		icon: 'quotes',
		iconTitle: ve.msg( 'visualeditor-find-and-replace-word' ),
		value: ve.userConfig( 'visualeditor-findAndReplace-word' )
	} );

	this.previousButton = new OO.ui.ButtonWidget( {
		icon: 'previous',
		iconTitle: ve.msg( 'visualeditor-find-and-replace-previous-button' ) + ' ' +
			ve.ui.triggerRegistry.getMessages( 'findPrevious' ).join( ', ' )
	} );
	this.nextButton = new OO.ui.ButtonWidget( {
		icon: 'next',
		iconTitle: ve.msg( 'visualeditor-find-and-replace-next-button' ) + ' ' +
			ve.ui.triggerRegistry.getMessages( 'findNext' ).join( ', ' )
	} );
	this.replaceText = new OO.ui.TextInputWidget( {
		placeholder: ve.msg( 'visualeditor-find-and-replace-replace-text' ),
		value: ve.userConfig( 'visualeditor-findAndReplace-replaceText' )
	} );
	this.replaceButton = new OO.ui.ButtonWidget( {
		label: ve.msg( 'visualeditor-find-and-replace-replace-button' )
	} );
	this.replaceAllButton = new OO.ui.ButtonWidget( {
		label: ve.msg( 'visualeditor-find-and-replace-replace-all-button' )
	} );

	optionsGroup = new OO.ui.ButtonGroupWidget( {
			classes: [ 've-ui-findAndReplaceDialog-cell' ],
			items: [
				this.matchCaseToggle,
				this.regexToggle,
				this.wordToggle
			]
		} );
	navigateGroup = new OO.ui.ButtonGroupWidget( {
		classes: [ 've-ui-findAndReplaceDialog-cell' ],
		items: [
			this.previousButton,
			this.nextButton
		]
	} );
	replaceGroup = new OO.ui.ButtonGroupWidget( {
		classes: [ 've-ui-findAndReplaceDialog-cell' ],
		items: [
			this.replaceButton,
			this.replaceAllButton
		]
	} );
	doneButton = new OO.ui.ButtonWidget( {
		classes: [ 've-ui-findAndReplaceDialog-cell' ],
		label: ve.msg( 'visualeditor-find-and-replace-done' )
	} );
	$findRow = $( '<div>' ).addClass( 've-ui-findAndReplaceDialog-row' );
	$replaceRow = $( '<div>' ).addClass( 've-ui-findAndReplaceDialog-row' );

	// Events
	this.onWindowScrollThrottled = ve.throttle( this.onWindowScroll.bind( this ), 250 );
	this.updateFragmentsThrottled = ve.throttle( this.updateFragments.bind( this ), 250 );
	this.renderFragmentsThrottled = ve.throttle( this.renderFragments.bind( this ), 250 );
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
	this.nextButton.connect( this, { click: 'findNext' } );
	this.previousButton.connect( this, { click: 'findPrevious' } );
	this.replaceButton.connect( this, { click: 'onReplaceButtonClick' } );
	this.replaceAllButton.connect( this, { click: 'onReplaceAllButtonClick' } );
	doneButton.connect( this, { click: 'close' } );

	this.findText.$input.on( 'keydown', this.onFindTextKeyDown.bind( this ) );
	this.replaceText.$input.on( 'keydown', this.onReplaceTextKeyDown.bind( this ) );

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
ve.ui.FindAndReplaceDialog.prototype.getSetupProcess = function ( data ) {
	data = data || {};
	return ve.ui.FindAndReplaceDialog.super.prototype.getSetupProcess.call( this, data )
		.first( function () {
			this.surface = data.surface;
			this.surface.$selections.append( this.$findResults );

			// Events
			this.surface.getModel().connect( this, { documentUpdate: 'onSurfaceModelDocumentUpdate' } );
			this.surface.getView().connect( this, { position: 'onSurfaceViewPosition' } );
			this.surface.getView().$window.on( 'scroll', this.onWindowScrollThrottled );
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.FindAndReplaceDialog.prototype.getReadyProcess = function ( data ) {
	return ve.ui.FindAndReplaceDialog.super.prototype.getReadyProcess.call( this, data )
		.next( function () {
			this.focus();
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.FindAndReplaceDialog.prototype.getTeardownProcess = function ( data ) {
	return ve.ui.FindAndReplaceDialog.super.prototype.getTeardownProcess.call( this, data )
		.next( function () {
			var selection,
				surfaceView = this.surface.getView(),
				surfaceModel = this.surface.getModel();

			// Events
			this.surface.getModel().disconnect( this );
			surfaceView.disconnect( this );
			this.surface.getView().$window.off( 'scroll', this.onWindowScrollThrottled );

			// If the surface isn't selected, put the selection back in a sensible place
			if ( surfaceModel.getSelection() instanceof ve.dm.NullSelection ) {
				if ( this.fragments.length ) {
					// Either the active search result...
					selection = this.fragments[ this.focusedIndex ].getSelection();
				} else if ( !( this.initialFragment.getSelection() instanceof ve.dm.NullSelection ) ) {
					// ... or the initial selection
					selection = this.initialFragment.getSelection();
				}
			}
			if ( selection ) {
				surfaceModel.setSelection( selection );
			} else {
				// If the selection wasn't changed, focus anyway
				surfaceView.focus();
			}
			this.$findResults.empty().detach();
			this.fragments = [];
			this.surface = null;
			this.focusedIndex = 0;
		}, this );
};

/**
 * Handle documentUpdate events from the surface model
 */
ve.ui.FindAndReplaceDialog.prototype.onSurfaceModelDocumentUpdate = function () {
	if ( this.replacing ) {
		return;
	}
	this.clearRenderedResultsCache();
	this.updateFragmentsThrottled();
};

/**
 * Handle position events from the surface view
 */
ve.ui.FindAndReplaceDialog.prototype.onSurfaceViewPosition = function () {
	if ( this.replacing ) {
		return;
	}
	this.clearRenderedResultsCache();
	this.renderFragmentsThrottled();
};

/**
 * Handle window scroll events
 */
ve.ui.FindAndReplaceDialog.prototype.onWindowScroll = function () {
	if ( this.renderedFragments.getLength() < this.results ) {
		// If viewport clipping is being used, reposition results based on the current viewport
		this.renderFragments();
	}
};

/**
 * Handle change events to the find inputs (text or match case)
 */
ve.ui.FindAndReplaceDialog.prototype.onFindChange = function () {
	this.updateFragments();
	this.clearRenderedResultsCache();
	this.renderFragments();
	this.highlightFocused( true );
	ve.userConfig( {
		'visualeditor-findAndReplace-findText': this.findText.getValue(),
		'visualeditor-findAndReplace-matchCase': this.matchCaseToggle.getValue(),
		'visualeditor-findAndReplace-regex': this.regexToggle.getValue(),
		'visualeditor-findAndReplace-word': this.wordToggle.getValue()
	} );
};

/**
 * Handle change events to the replace input
 */
ve.ui.FindAndReplaceDialog.prototype.onReplaceChange = function () {
	ve.userConfig( 'visualeditor-findAndReplace-replaceText', this.replaceText.getValue() );
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
 * Handle keydown events on the find text input
 *
 * @param {jQuery.Event} e
 */
ve.ui.FindAndReplaceDialog.prototype.onFindTextKeyDown = function ( e ) {
	if ( e.which === OO.ui.Keys.TAB && !e.shiftKey ) {
		this.replaceText.$input.focus();
		e.preventDefault();
	}
};

/**
 * Handle keydown events on the replace text input
 *
 * @param {jQuery.Event} e
 */
ve.ui.FindAndReplaceDialog.prototype.onReplaceTextKeyDown = function ( e ) {
	if ( e.which === OO.ui.Keys.TAB && e.shiftKey ) {
		this.findText.$input.focus();
		e.preventDefault();
	}
};

/**
 * Update search result fragments
 */
ve.ui.FindAndReplaceDialog.prototype.updateFragments = function () {
	var i, l, startIndex,
		surfaceModel = this.surface.getModel(),
		documentModel = surfaceModel.getDocument(),
		ranges = [],
		matchCase = this.matchCaseToggle.getValue(),
		isRegex = this.regexToggle.getValue(),
		wholeWord = this.wordToggle.getValue(),
		find = this.findText.getValue();

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
	if ( this.query ) {
		ranges = documentModel.findText( this.query, {
			caseSensitiveString: matchCase,
			noOverlaps: true,
			wholeWord: wholeWord
		} );
		for ( i = 0, l = ranges.length; i < l; i++ ) {
			this.fragments.push( surfaceModel.getLinearFragment( ranges[ i ], true, true ) );
			if ( startIndex === undefined && ranges[ i ].start >= this.startOffset ) {
				startIndex = this.fragments.length - 1;
			}
		}
	}
	this.results = this.fragments.length;
	this.focusedIndex = startIndex || 0;
	this.nextButton.setDisabled( !this.results );
	this.previousButton.setDisabled( !this.results );
	this.replaceButton.setDisabled( !this.results );
	this.replaceAllButton.setDisabled( !this.results );
};

/**
 * Position results markers
 */
ve.ui.FindAndReplaceDialog.prototype.renderFragments = function () {
	var i, selection, viewportRange, start, end;

	// Check the surface isn't hidden, such as during deactivation
	if ( !this.surface || !this.surface.getView().$element.is( ':visible' ) ) {
		return;
	}

	start = 0;
	end = this.results;

	// When there are a large number of results, calculate the viewport range for clipping
	if ( this.results > 50 ) {
		viewportRange = this.surface.getView().getViewportRange();
		for ( i = 0; i < this.results; i++ ) {
			selection = this.fragments[ i ].getSelection();
			if ( viewportRange && selection.getRange().start < viewportRange.start ) {
				start = i + 1;
				continue;
			}
			if ( viewportRange && selection.getRange().end > viewportRange.end ) {
				end = i;
				break;
			}
		}
	}

	// When there are too many results to render, just render the current one
	if ( end - start <= this.constructor.static.maxRenderedResults ) {
		this.renderRangeOfFragments( new ve.Range( start, end ) );
	} else {
		this.renderRangeOfFragments( new ve.Range( this.focusedIndex, this.focusedIndex + 1 ) );
	}
};

/**
 * Clear the rendered results cache
 */
ve.ui.FindAndReplaceDialog.prototype.clearRenderedResultsCache = function () {
	this.renderedResultsCache = {};
	this.$findResults.empty();
};

/**
 * Render subset of search result fragments
 *
 * @param {ve.Range} range Range of fragments to render
 */
ve.ui.FindAndReplaceDialog.prototype.renderRangeOfFragments = function ( range ) {
	var i, j, jlen, rects, $result, top;
	this.$findResults.empty();
	for ( i in this.renderedResultsCache ) {
		if ( !range.containsOffset( i ) ) {
			this.renderedResultsCache[ i ].detach();
		}
	}
	for ( i = range.start; i < range.end; i++ ) {
		if ( this.renderedResultsCache[ i ] ) {
			this.$findResults.append( this.renderedResultsCache[ i ] );
		} else {
			rects = this.surface.getView().getSelection( this.fragments[ i ].getSelection() ).getSelectionRects();
			$result = $( '<div>' ).addClass( 've-ui-findAndReplaceDialog-findResult' );
			top = Infinity;
			for ( j = 0, jlen = rects.length; j < jlen; j++ ) {
				top = Math.min( top, rects[ j ].top );
				$result.append( $( '<div>' ).css( {
					top: rects[ j ].top,
					left: rects[ j ].left,
					width: rects[ j ].width,
					height: rects[ j ].height
				} ) );
			}
			$result.data( 'top', top );
			this.$findResults.append( $result );
			this.renderedResultsCache[ i ] = $result;
		}
	}
	this.renderedFragments = range;
	this.highlightFocused();
};

/**
 * Highlight the focused result marker
 *
 * @param {boolean} scrollIntoView Scroll the marker into view
 */
ve.ui.FindAndReplaceDialog.prototype.highlightFocused = function ( scrollIntoView ) {
	var $result, rect, top,
		offset, windowScrollTop, windowScrollHeight,
		surfaceView = this.surface.getView();

	if ( this.results ) {
		this.findText.setLabel(
			ve.msg( 'visualeditor-find-and-replace-results', this.focusedIndex + 1, this.results )
		);
	} else {
		this.findText.setLabel(
			this.invalidRegex ? ve.msg( 'visualeditor-find-and-replace-invalid-regex' ) : ''
		);
		return;
	}

	this.startOffset = this.fragments[ this.focusedIndex ].getSelection().getCoveringRange().start;

	this.$findResults
		.find( '.ve-ui-findAndReplaceDialog-findResult-focused' )
		.removeClass( 've-ui-findAndReplaceDialog-findResult-focused' );

	if ( this.renderedFragments.containsOffset( this.focusedIndex ) ) {
		$result = this.renderedResultsCache[ this.focusedIndex ].addClass( 've-ui-findAndReplaceDialog-findResult-focused' );

		top = $result.data( 'top' );
	} else if ( scrollIntoView ) {
		// If we're about to scroll into view and the result isn't rendered, compute the offset manually.
		rect = surfaceView.getSelection( this.fragments[ this.focusedIndex ].getSelection() ).getSelectionBoundingRect();
		top = rect.top;
	}

	if ( scrollIntoView ) {
		surfaceView = this.surface.getView();
		offset = top + surfaceView.$element.offset().top;
		windowScrollTop = surfaceView.$window.scrollTop() + this.surface.toolbarHeight;
		windowScrollHeight = surfaceView.$window.height() - this.surface.toolbarHeight;

		if ( offset < windowScrollTop || offset > windowScrollTop + windowScrollHeight ) {
			$( 'body, html' ).animate( { scrollTop: offset - ( windowScrollHeight / 2  ) }, 'fast' );
		}
	}
};

/**
 * Focus the dialog
 */
ve.ui.FindAndReplaceDialog.prototype.focus = function () {
	this.findText.focus().select();
};

/**
 * Find the first result on opening
 */
ve.ui.FindAndReplaceDialog.prototype.findFirst = function () {
	var text,
		fragment = this.surface.getModel().getFragment( null, true );

	this.initialFragment = fragment;
	this.startOffset = ve.getProp( this.initialFragment.getSelection().getRanges(), 0, 'start' ) || 0;

	text = fragment.getText();
	if ( text && text !== this.findText.getValue() ) {
		this.findText.setValue( text );
	} else {
		this.onFindChange();
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
	var end;

	if ( !this.results ) {
		return;
	}

	this.replace( this.focusedIndex );

	// Find the next fragment after this one ends. Ensures that if we replace
	// 'foo' with 'foofoo' we don't select the just-inserted text.
	end = this.fragments[ this.focusedIndex ].getSelection().getRange().end;

	this.updateFragments();

	if ( !this.results ) {
		this.focusedIndex = 0;
		return;
	}
	while ( this.fragments[ this.focusedIndex ] && this.fragments[ this.focusedIndex ].getSelection().getRange().end <= end ) {
		this.focusedIndex++;
	}
	// We may have iterated off the end
	this.focusedIndex = this.focusedIndex % this.results;

	this.clearRenderedResultsCache();
	this.renderFragments();
};

/**
 * Handle click events on the previous all button
 */
ve.ui.FindAndReplaceDialog.prototype.onReplaceAllButtonClick = function () {
	var i, l;

	for ( i = 0, l = this.results; i < l; i++ ) {
		this.replace( i );
	}
	this.updateFragments();
	this.clearRenderedResultsCache();
	this.renderFragments();
};

/**
 * Replace the result at a specified index
 *
 * @param {number} index Index to replace
 */
ve.ui.FindAndReplaceDialog.prototype.replace = function ( index ) {
	var dialog = this,
		replace = this.replaceText.getValue();

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
	setTimeout( function () {
		dialog.replacing = false;
	} );
};

/**
 * @inheritdoc
 */
ve.ui.FindAndReplaceDialog.prototype.getActionProcess = function ( action ) {
	if ( action === 'findFirst' || action === 'findNext' || action === 'findPrevious' ) {
		return new OO.ui.Process( this[ action ], this );
	}
	return ve.ui.FindAndReplaceDialog.super.prototype.getActionProcess.call( this, action );
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.FindAndReplaceDialog );
