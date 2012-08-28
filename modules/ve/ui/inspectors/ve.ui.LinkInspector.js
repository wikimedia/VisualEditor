/*global mw*/

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
 * @param {ve.ui.Toolbar} toolbar
 */
ve.ui.LinkInspector = function ( toolbar, context ) {
	var inspector = this;

	// Inheritance
	ve.ui.Inspector.call( this, toolbar, context );

	// Properties
	this.context = context;
	this.initialValue = null;
	this.$clearButton = $(
		'<div class="ve-ui-inspector-button ve-ui-inspector-clearButton"></div>',
		context.inspectorDoc
	);
	this.$title = $( '<div class="ve-ui-inspector-title"></div>', context.inspectorDoc )
		.text( ve.msg( 'visualeditor-linkinspector-title' ) );
	this.$locationInput = $(
		'<input type="text" class="ve-ui-linkInspector-location" />',
		context.inspectorDoc
	);

	// Events
	this.$clearButton.click( function () {
		if ( $(this).is( '.ve-ui-inspector-button-disabled' ) ) {
			return;
		}
		var hash,
			surfaceModel = inspector.context.getSurfaceView().getModel(),
			annotations = inspector.getAllLinkAnnotationsFromSelection();
		// Clear all link annotations.
		for ( hash in annotations ) {
			surfaceModel.annotate( 'clear', annotations[hash] );
		}
		inspector.$locationInput.val( '' );
		inspector.context.closeInspector();
	} );
	this.$locationInput.on( 'change mousedown keydown cut paste', function () {
		setTimeout( function () {
			// Toggle disabled class
			if ( inspector.$locationInput.val() !== '' ) {
				inspector.$acceptButton.removeClass( 've-ui-inspector-button-disabled' );
			} else {
				inspector.$acceptButton.addClass( 've-ui-inspector-button-disabled' );
			}

		}, 0 );
	} );

	// DOM Changes
	this.$.prepend( this.$title, this.$clearButton );
	this.$form.append( this.$locationInput );

	// Init multiSuggest for MediaWiki
	if ( 'mw' in window ) {
		this.initMultiSuggest();
	}
};

/* Methods */

ve.ui.LinkInspector.prototype.getAllLinkAnnotationsFromSelection = function () {
	var surfaceView = this.context.getSurfaceView(),
		surfaceModel = surfaceView.getModel(),
		documentModel = surfaceModel.getDocument(),
		annotations,
		linkAnnotations = {};

		annotations = documentModel.getAnnotationsFromRange( surfaceModel.getSelection(), true );
		linkAnnotations = ve.dm.Document.getMatchingAnnotations ( annotations,  /^link\//  );
		if ( !ve.isEmptyObject( linkAnnotations ) ) {
			return linkAnnotations;
		}

	return null;
};

ve.ui.LinkInspector.prototype.getFirstLinkAnnotation = function ( annotations ) {
	var hash;
	for ( hash in annotations ) {
		// Use the first one with a recognized type (there should only be one, this is just in case)
		if (
			annotations[hash].type === 'link/WikiLink' ||
			annotations[hash].type === 'link/ExtLink' ||
			annotations[hash].type === 'link/ExtLink/Numbered' ||
			annotations[hash].type === 'link/ExtLink/URL'
		) {
			return annotations[hash];
		}
	}
	return null;
};

// TODO: This should probably be somewhere else but I needed this here for now.
ve.ui.LinkInspector.prototype.getSelectionText = function () {
	var i,
		surfaceView = this.context.getSurfaceView(),
		surfaceModel = surfaceView.getModel(),
		documentModel = surfaceModel.getDocument(),
		data = documentModel.getData( surfaceModel.getSelection() ),
		str = '',
		max = Math.min( data.length, 255 );
	for ( i = 0; i < max; i++ ) {
		if ( ve.isArray( data[i] ) ) {
			str += data[i][0];
		} else if( typeof data[i] === 'string' ) {
			str += data[i];
		}
	}
	return str;
};

/*
 * Method called prior to opening inspector which fixes up
 * selection to contain the complete annotated link range
 * OR unwrap outer whitespace from selection.
 */
ve.ui.LinkInspector.prototype.prepareOpen = function () {
	var	surfaceView = this.context.getSurfaceView(),
		surfaceModel = surfaceView.getModel(),
		doc = surfaceModel.getDocument(),
		annotations = this.getAllLinkAnnotationsFromSelection(),
		annotation = this.getFirstLinkAnnotation( annotations ),
		selection = surfaceModel.getSelection(),
		annotatedRange,
		newSelection;

	// Trim outer space from range if any.
	newSelection = doc.trimOuterSpaceFromRange( selection );

	if ( annotation !== null ) {
		annotatedRange = doc.getAnnotatedRangeFromSelection( newSelection, annotation );

		// Adjust selection if it does not contain the annotated range
		if ( selection.start > annotatedRange.start ||
			 selection.end < annotatedRange.end
		) {
			newSelection = annotatedRange;
			// if selected from right to left
			if ( selection.from > selection.start ) {
				newSelection.flip();
			}
		}
	}
	surfaceModel.change( null, newSelection );
};

ve.ui.LinkInspector.prototype.onOpen = function () {
	var	annotation = this.getFirstLinkAnnotation( this.getAllLinkAnnotationsFromSelection() ),
		initialValue = '';
	if ( annotation === null ) {
		this.$locationInput.val( this.getSelectionText() );
		this.$clearButton.addClass( 've-ui-inspector-button-disabled' );
	} else if ( annotation.type === 'link/WikiLink' ) {
		// Internal link
		initialValue = annotation.data.title || '';
		this.$locationInput.val( initialValue );
		this.$clearButton.removeClass( 've-ui-inspector-button-disabled' );
	} else {
		// External link
		initialValue = annotation.data.href || '';
		this.$locationInput.val( initialValue );
		this.$clearButton.removeClass( 've-ui-inspector-button-disabled' );
	}
	this.initialValue = initialValue;
	if ( this.$locationInput.val().length === 0 ) {
		this.$acceptButton.addClass( 've-ui-inspector-button-disabled' );
	} else {
		this.$acceptButton.removeClass( 've-ui-inspector-button-disabled' );
	}

	setTimeout( ve.bind( function () {
		this.$locationInput.focus().select();
	}, this ), 0 );
};

ve.ui.LinkInspector.prototype.onClose = function ( accept ) {
	var surfaceView = this.context.getSurfaceView(),
		surfaceModel = surfaceView.getModel(),
		annotations = this.getAllLinkAnnotationsFromSelection(),
		target = this.$locationInput.val(),
		hash, annotation;
	if ( accept ) {
		if ( !target ) {
			return;
		}
		// Clear link annotation if it exists
		for ( hash in annotations ) {
			surfaceModel.annotate( 'clear', annotations[hash] );
		}
		surfaceModel.annotate( 'set', ve.ui.LinkInspector.getAnnotationForTarget( target ) );

	}
	// Restore focus
	surfaceView.getDocument().getDocumentNode().$.focus();
};

ve.ui.LinkInspector.getAnnotationForTarget = function ( target ) {
	var title;
	// Figure out if this is an internal or external link
	if ( target.match( /^(https?:)?\/\// ) ) {
		// External link
		return {
			'type': 'link/ExtLink',
			'data': { 'href': target }
		};
	} else {
		// Internal link
		// TODO in the longer term we'll want to have autocompletion and existence&validity
		// checks using AJAX
		try {
			// FIXME mw dependency
			title = new mw.Title( target );
			if ( title.getNamespaceId() === 6 || title.getNamespaceId() === 14 ) {
				// File: or Category: link
				// We have to prepend a colon so this is interpreted as a link
				// rather than an image inclusion or categorization
				target = ':' + target;
			}
		} catch ( e ) { }

		return {
			'type': 'link/WikiLink',
			'data': { 'title': target }
		};
	}
};

ve.ui.LinkInspector.prototype.initMultiSuggest = function () {
	var inspector = this,
		context = inspector.context,
		$overlay = context.$iframeOverlay,
		cache = {},
		options;

	// Multi Suggest configuration.
	options = {
		'parent': $overlay,
		'prefix': 've-ui',
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
			// Run the query through the mw.Title object to handle correct capitalization.
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
				cKey = query.toLowerCase(),
				api = null;

			// Set overlay position.
			options.position();
			// Build from cache.
			if ( cache[cKey] !== undefined ) {
				callback( {
					'query': query,
					'results': cache[cKey]
				} );
			} else {
				// No cache, build fresh.
				api = new mw.Api();
				// MW api request.
				api.get( {
					'action': 'opensearch',
					'search': query
				}, {
					'ok': function ( data ) {
						cache[cKey] = data[1];
						// Build
						callback( {
							'query': query,
							'results': data[1]
						} );
					}
				} );
			}
		},
		// Position the iframe overlay below the input.
		'position': function () {
			context.positionIframeOverlay( {
				'overlay': $overlay,
				'below': inspector.$locationInput
			} );
		}
	};
	// Setup Multi Suggest
	this.$locationInput.multiSuggest( options );
};

/* Inheritance */

ve.extendClass( ve.ui.LinkInspector, ve.ui.Inspector );
