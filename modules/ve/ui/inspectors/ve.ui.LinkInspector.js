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
 * Responds to location input change events.
 *
 * This will be triggered from a variety of events including those from mouse, keyboard and
 * clipboard actions.
 *
 * @method
 */
ve.ui.LinkInspector.prototype.onLocationInputChange = function() {
	// Some events, such as keydown, fire before the value has actually changed - waiting for the
	// call stack to clear will ensure that we have access to the new value as soon as possible
	setTimeout( ve.bind( function () {
		this.setDisabled(
			this.$locationInput.val() === '' ||
			this.$locationInput.data( 'status' ) === 'invalid'
		);
	}, this ), 0 );
};

/**
 * Responds to the inspector being opened.
 *
 * @method
 */
ve.ui.LinkInspector.prototype.onOpen = function () {
	var target = '',
		annotation = this.getMatchingAnnotations().get( 0 );

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

	// Update controls
	this.reset();
	this.$locationInput.val( target );
	this.setDisabled( this.$locationInput.val().length === 0 );

	// Set focus on the location input
	setTimeout( ve.bind( function () {
		this.$locationInput.focus().select();
	}, this ), 0 );
};

/**
 * Responds to the inspector being opened.
 *
 * @method
 */
ve.ui.LinkInspector.prototype.onClose = function ( accept ) {
	var target = this.$locationInput.val(),
		surface = this.context.getSurface(),
		selection = surface.getModel().getSelection();
	if ( accept && target && target !== this.initialTarget ) {
		if ( this.isNewAnnotation ) {
			// Go back to before we add an annotation in prepareSelection
			surface.execute( 'history', 'undo' );
			// Restore selection to be sure we are still working on the same range
			surface.execute( 'content', 'select', selection );
		} else {
			// Clear all existing annotations
			surface.execute( 'annotation', 'clearAll', this.constructor.static.typePattern );
		}
		// Apply the new annotation
		surface.execute( 'annotation', 'set', this.getAnnotationFromTarget( target ) );
	}
	this.isNewAnnotation = false;
	this.context.getSurface().getView().getDocument().getDocumentNode().$.focus();
};

/**
 * Returns the form to it's initial state.
 *
 * @method
 */
ve.ui.LinkInspector.prototype.reset = function () {
	this.$locationInput.val( '' );
};

/**
 * Prepares the inspector to be opened.
 *
 * Selection will be fixed up so that if there's an existing link the complete link is selected,
 * otherwise the range will be contracted so there is no leading and trailing whitespace.
 *
 * @method
 */
ve.ui.LinkInspector.prototype.prepareSelection = function () {
	var fragment = this.context.getSurface().getModel().getFragment(),
		annotation = this.getMatchingAnnotations().get( 0 );
	if ( !annotation ) {
		// Create annotation from selection
		fragment = fragment.trimRange();
		fragment.annotateContent(
			'set', this.getAnnotationFromTarget( fragment.truncateRange( 255 ).getText() )
		);
	} else {
		// Expand range to cover annotation
		fragment = fragment.expandRange( 'annotation', annotation );
	}
	// Update selection
	fragment.select();
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
		if ( status !== 'invalid' ) {
			inspector.$.removeClass( 've-ui-inspector-disabled' );
		} else {
			inspector.$.addClass( 've-ui-inspector-disabled' );
		}
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
			var groups = {},
				results = params.results,
				query = params.query,
				modifiedQuery,
				title,
				prot;

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
