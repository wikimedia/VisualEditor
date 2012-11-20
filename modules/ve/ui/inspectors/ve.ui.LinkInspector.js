/*global mw */

/**
 * VisualEditor user interface LinkInspector class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.LinkInspector object.
 *
 * @class
 * @constructor
 * @extends {ve.ui.Inspector}
 * @param context
 */
ve.ui.LinkInspector = function VeUiLinkInspector( context ) {
	// Parent constructor
	ve.ui.Inspector.call( this, context );

	// Properties
	this.context = context;
	this.initialTarget = null;
	this.isNewAnnotation = false;
	this.$locationInput = this.frame.$$(
		'<input type="text" class="ve-ui-linkInspector-location ve-ui-icon-down" />'
	);

	// Initialization
	this.$form.append( this.$locationInput );

	// FIXME: MediaWiki-specific
	if ( 'mw' in window ) {
		this.initMultiSuggest();
	}
};

/* Inheritance */

ve.inheritClass( ve.ui.LinkInspector, ve.ui.Inspector );

/* Static properties */

ve.ui.LinkInspector.static.icon = 'link';

ve.ui.LinkInspector.static.titleMessage = 'visualeditor-linkinspector-title';

ve.ui.LinkInspector.static.typePattern = /^link(\/MW(in|ex)ternal)?$/;

/* Methods */

/**
 * Responds to the inspector being initialized.
 *
 * There are 4 scenarios:
 *     * Zero-length selection not near a word -> no change, text will be inserted on close
 *     * Zero-length selection inside or adjacent to a word -> expand selection to cover word
 *     * Selection covering non-link text -> trim selection to remove leading/trailing whitespace
 *     * Selection covering link text -> expand selection to cover link
 *
 * @method
 */
ve.ui.LinkInspector.prototype.onInitialize = function () {
	var fragment = this.context.getSurface().getModel().getFragment(),
		annotation = this.getMatchingAnnotations( fragment ).get( 0 );
	if ( !annotation ) {
		if ( fragment.getRange().isCollapsed() ) {
			// Expand to nearest word
			fragment = fragment.expandRange( 'word' );
		} else {
			// Trim whitespace
			fragment = fragment.trimRange();
		}
		if ( !fragment.getRange().isCollapsed() ) {
			// Create annotation from selection
			fragment.annotateContent(
				'set', this.getAnnotationFromTarget( fragment.truncateRange( 255 ).getText() )
			);
			this.isNewAnnotation = true;
		}
	} else {
		// Expand range to cover annotation
		fragment = fragment.expandRange( 'annotation', annotation );
	}
	// Update selection
	fragment.select();
};

/**
 * Responds to the inspector being opened.
 *
 * @method
 */
ve.ui.LinkInspector.prototype.onOpen = function () {
	var target = '',
		fragment = this.context.getSurface().getModel().getFragment(),
		annotation = this.getMatchingAnnotations( fragment ).get( 0 );

	if ( annotation ) {
		if ( annotation instanceof ve.dm.MWInternalLinkAnnotation ) {
			// Internal link
			target = annotation.data.title || '';
		} else {
			// External link
			target = annotation.data.href || '';
		}
	}
	this.initialTarget = target;

	// Initialize form
	this.$locationInput.val( target );

	// Set focus on the location input
	setTimeout( ve.bind( function () {
		this.$locationInput.focus().select();
	}, this ), 0 );
};

/**
 * Responds to the inspector being opened.
 *
 * @method
 * @param {Boolean} remove Annotation should be removed
 */
ve.ui.LinkInspector.prototype.onClose = function ( remove ) {
	var i, len, annotations,
		insert = false,
		undo = false,
		clear = false,
		set = false,
		target = this.$locationInput.val(),
		surface = this.context.getSurface(),
		selection = surface.getModel().getSelection(),
		fragment = surface.getModel().getFragment( this.initialSelection, false );
	// Empty target is a shortcut for removal
	if ( target === '' ) {
		remove = true;
	}
	if ( remove ) {
		clear = true;
	} else {
		if ( this.initialSelection.isCollapsed() ) {
			insert = true;
		}
		if ( target !== this.initialTarget ) {
			if ( this.isNewAnnotation ) {
				undo = true;
			} else {
				clear = true;
			}
			set = true;
		}
	}
	if ( insert ) {
		// Insert default text and select it
		fragment = fragment.insertContent( target, false ).adjustRange( -target.length );
	}
	if ( undo ) {
		// Go back to before we added an annotation in an onInitialize handler
		surface.execute( 'history', 'undo' );
	}
	if ( clear ) {
		// Clear all existing annotations
		annotations = this.getMatchingAnnotations( fragment ).get();
		for ( i = 0, len = annotations.length; i < len; i++ ) {
			fragment.annotateContent( 'clear', annotations[i] );
		}
	}
	if ( set ) {
		// Apply new annotation
		fragment.annotateContent( 'set', this.getAnnotationFromTarget( target ) );
	}
	// Selection changes may have occured in the insertion and annotation hullabaloo - restore it
	surface.execute( 'content', 'select', selection );
	// Reset state
	this.isNewAnnotation = false;
};

/**
 * Gets an annotation object from a target.
 *
 * The type of link is automatically detected based on some crude heuristics.
 *
 * @method
 * @param {String} target Link target
 * @returns {ve.dm.Annotation}
 */
ve.ui.LinkInspector.prototype.getAnnotationFromTarget = function ( target ) {
	var title, annotation;
	// FIXME: MediaWiki-specific
	if ( 'mw' in window ) {
		// Figure out if this is an internal or external link
		if ( target.match( /^(https?:)?\/\// ) ) {
			// External link
			annotation = new ve.dm.MWExternalLinkAnnotation();
			annotation.data.href = target;
		} else {
			// Internal link
			// TODO: In the longer term we'll want to have autocompletion and existence and validity
			// checks using AJAX
			try {
				title = new mw.Title( target );
				if ( title.getNamespaceId() === 6 || title.getNamespaceId() === 14 ) {
					// File: or Category: link
					// We have to prepend a colon so this is interpreted as a link
					// rather than an image inclusion or categorization
					target = ':' + target;
				}
			} catch ( e ) { }
			annotation = new ve.dm.MWInternalLinkAnnotation();
			annotation.data.title = target;
		}
	} else {
		// Default to generic external link
		annotation = new ve.dm.LinkAnnotation();
		annotation.data.href = target;
	}
	return annotation;
};

/**
 * Initalizes the multi-suggest plugin for the location input.
 *
 * TODO: Consider cleaning up and organizing this all a bit.
 *
 * @method
 */
ve.ui.LinkInspector.prototype.initMultiSuggest = function () {
	var options,
		inspector = this,
		context = inspector.context,
		$overlay = context.$overlay,
		suggestionCache = {},
		pageStatusCache = {},
		api = new mw.Api();
	function updateLocationStatus( status ) {
		inspector.$locationInput.data( 'status', status );
	}

	// Multi Suggest configuration.
	options = {
		'parent': $overlay,
		'prefix': 've-ui',
		// Disable CSS Ellipsis.
		// Using MediaWiki jQuery.autoEllipsis() for center ellipsis.
		'cssEllipsis': false,
		// Build suggestion groups in order.
		'suggestions': function ( params ) {
			var modifiedQuery, title, prot,
				groups = {},
				results = params.results,
				query = params.query;

			// Add existing pages.
			if ( results.length > 0 ) {
				groups.existingPage = {
					'label': ve.msg( 'visualeditor-linkinspector-suggest-existing-page' ),
					'items': results,
					'itemClass': 've-ui-suggest-item-existingPage'
				};
			}
			// Run the query through the mw.Title object to handle correct capitalization,
			// whitespace and and namespace alias/localization resolution.
			try {
				title = new mw.Title( query );
				modifiedQuery = title.getPrefixedText();
				// If page doesn't exist, add New Page group.
				if ( ve.indexOf( modifiedQuery, results ) === -1 ) {
					groups.newPage = {
						'label': ve.msg( 'visualeditor-linkinspector-suggest-new-page' ),
						'items': [modifiedQuery],
						'itemClass': 've-ui-suggest-item-newPage'
					};
				}
			} catch ( e ) {
				// invalid input
				ve.log( e );
			}
			// Add external
			groups.externalLink = {
				'label': ve.msg( 'visualeditor-linkinspector-suggest-external-link' ),
				'items': [],
				'itemClass': 've-ui-suggest-item-externalLink'
			};
			// Find a protocol and suggest an external link.
			prot = query.match(
				ve.init.platform.getExternalLinkUrlProtocolsRegExp()
			);
			if ( prot ) {
				groups.externalLink.items = [query];
			// No protocol, default to http
			} else {
				groups.externalLink.items = ['http://' + query];
			}
			return groups;
		},
		// Called on succesfull input.
		'input': function ( callback ) {
			var $input = $( this ),
				query = $input.val(),
				cKey = query.toLowerCase();

			// Query page and set status data on the location input.
			if ( pageStatusCache[query] !== undefined ) {
				updateLocationStatus( pageStatusCache[query] );
			} else {
				api.get( {
					'action': 'query',
					'indexpageids': '',
					'titles': query,
					'converttitles': ''
				} )
				.done( function ( data ) {
					var status, page;
					if ( data.query ) {
						page = data.query.pages[data.query.pageids[0]];
						status = 'exists';
						if ( page.missing !== undefined ) {
							status = 'notexists';
						} else if ( page.invalid !== undefined ) {
							status = 'invalid';
						}
					}
					// Cache the status of the link query.
					pageStatusCache[query] = status;
					updateLocationStatus( status );
				} );
			}

			// Set overlay position.
			options.position();
			// Build from cache.
			if ( suggestionCache[cKey] !== undefined ) {
				callback( {
					'query': query,
					'results': suggestionCache[cKey]
				} );
			} else {
				// No cache, build fresh api request.
				api.get( {
					'action': 'opensearch',
					'search': query
				} )
				.done( function ( data ) {
					suggestionCache[cKey] = data[1];
					// Build
					callback( {
						'query': query,
						'results': data[1]
					} );
				} );
			}
		},
		// Called when multiSuggest dropdown is updated.
		'update': function () {
			// Ellipsis
			$( '.ve-ui-suggest-item' )
				.autoEllipsis( {
					'hasSpan': true,
					'tooltip': true
				} );
		},
		// Position the iframe overlay below the input.
		'position': function () {
			context.positionOverlayBelow( $overlay, inspector.$locationInput );
		},
		// Fired when a suggestion is selected.
		'select': function () {
			// Assume page suggestion is valid.
			updateLocationStatus( 'valid' );
		}
	};
	// Setup Multi Suggest
	this.$locationInput.multiSuggest( options );
};

/* Registration */

ve.ui.inspectorFactory.register( 'link', ve.ui.LinkInspector );
