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
ve.ui.LinkInspector = function( toolbar, context ) {
	// Inheritance
	ve.ui.Inspector.call( this, toolbar, context );

	// Properties
	this.$clearButton = $( '<div class="es-inspector-button es-inspector-clear-button"></div>' )
		.prependTo( this.$ );
	this.$.prepend(
		$( '<div class="es-inspector-title"></div>' )
			.text( ve.msg( 'visualeditor-linkinspector-title' ) )
	);
	this.$locationLabel = $( '<label></label>' )
		.text( ve.msg( 'visualeditor-linkinspector-label-pagetitle' ) )
		.appendTo( this.$form );
	this.$locationInput = $( '<input type="text">' ).appendTo( this.$form );
	this.initialValue = null;

	// Events
	var inspector = this;
	this.$clearButton.click( function() {
		if ( $(this).is( '.es-inspector-button-disabled' ) ) {
			return;
		}

		var hash,
			surfaceModel = inspector.context.getSurfaceView().getModel(),
			annotations = inspector.getSelectedLinkAnnotations();
		// If link annotation exists, clear it.
		for ( hash in annotations ) {
			surfaceModel.annotate( 'clear', annotations[hash] );
		}
		inspector.$locationInput.val( '' );
		inspector.context.closeInspector();
	} );
	this.$locationInput.bind( 'mousedown keydown cut paste', function() {
		setTimeout( function() {
			if ( inspector.$locationInput.val() !== inspector.initialValue ) {
				inspector.$acceptButton.removeClass( 'es-inspector-button-disabled' );
			} else {
				inspector.$acceptButton.addClass( 'es-inspector-button-disabled' );
			}
		}, 0 );
	} );
};

/* Methods */

ve.ui.LinkInspector.prototype.getSelectedLinkAnnotations = function(){
	var surfaceView = this.context.getSurfaceView(),
		surfaceModel = surfaceView.getModel(),
		documentModel = surfaceModel.getDocument(),
		data = documentModel.getData( surfaceModel.getSelection() );

	if ( data.length ) {
		if ( ve.isPlainObject( data[0][1] ) ) {
			return ve.dm.Document.getMatchingAnnotations( data[0][1], /link\/.*/ );
		}
	}
	return {};
};

ve.ui.LinkInspector.prototype.getAnnotationFromSelection = function() {
	var hash,
		annotations = this.getSelectedLinkAnnotations();
	for ( hash in annotations ) {
		// Use the first one with a recognized type (there should only be one, but this is just in case)
		if ( annotations[hash].type === 'link/wikiLink' || annotations[hash].type === 'link/extLink' ) {
			return annotations[hash];
		}
	}
	return null;
};

// TODO: This should probably be somewhere else but I needed this here for now.
ve.ui.LinkInspector.prototype.getSelectionText = function() {
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
ve.ui.LinkInspector.prototype.prepareOpen = function() {
	var	surfaceView = this.context.getSurfaceView(),
		surfaceModel = surfaceView.getModel(),
		doc = surfaceModel.getDocument(),
		annotation = this.getAnnotationFromSelection(),
		selection = surfaceModel.getSelection(),
		newSelection;

	if ( annotation !== null ) {
		// Ensure that the entire annotated range is selected
		newSelection = doc.getAnnotatedRangeFromOffset( selection.start, annotation );
		// Apply selection direction to new selection
		if ( selection.from > selection.start ) {
			newSelection.flip();
		}
	} else {
		// No annotation, trim outer space from range
		newSelection = doc.trimOuterSpaceFromRange( selection );
	}

	surfaceModel.change( null, newSelection );
};

ve.ui.LinkInspector.prototype.onOpen = function() {
	var	annotation = this.getAnnotationFromSelection(),
		initialValue = '';

	if ( annotation === null ) {
		this.$locationInput.val( this.getSelectionText() );
		this.$clearButton.addClass( 'es-inspector-button-disabled' );
	} else if ( annotation.type === 'link/wikiLink' ) {
		// Internal link
		initialValue = annotation.data.title || '';
		this.$locationInput.val( initialValue );
		this.$clearButton.removeClass( 'es-inspector-button-disabled' );
	} else {
		// External link
		initialValue = annotation.data.href || '';
		this.$locationInput.val( initialValue );
		this.$clearButton.removeClass( 'es-inspector-button-disabled' );
	}

	this.initialValue = initialValue;
	if ( this.$locationInput.val().length === 0 ) {
		this.$acceptButton.addClass( 'es-inspector-button-disabled' );
	} else {
		this.$acceptButton.removeClass( 'es-inspector-button-disabled' );
	}

	setTimeout( ve.proxy( function() {
		this.$locationInput.focus().select();
	}, this ), 0 );
};

ve.ui.LinkInspector.prototype.onClose = function( accept ) {
	var surfaceView = this.context.getSurfaceView();
	if ( accept ) {
		var target = this.$locationInput.val();
		if ( target === this.initialValue || !target ) {
			return;
		}
		var surfaceModel = surfaceView.getModel(),
			annotations = this.getSelectedLinkAnnotations();

		// Clear link annotation if it exists
		for ( var hash in annotations ) {
			surfaceModel.annotate( 'clear', annotations[hash] );
		}

		var annotation;
		// Figure out if this is an internal or external link
		// TODO better logic
		if ( target.match( /^(https?:)?\/\// ) ) {
			// External link
			annotation = {
				'type': 'link/extLink',
				'data': { 'href': target }
			};
		} else {
			// Internal link
			annotation = {
				'type': 'link/wikiLink',
				'data': { 'title': target }
			};
		}
		surfaceModel.annotate( 'set', annotation );
	}
	// Restore focus
	surfaceView.getDocument().getDocumentNode().$.focus();
};

/* Inheritance */

ve.extendClass( ve.ui.LinkInspector, ve.ui.Inspector );
