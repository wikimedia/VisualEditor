/*!
 * VisualEditor UserInterface LinkInspector class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface link inspector.
 *
 * @class
 * @extends ve.ui.Inspector
 * @constructor
 * @param context
 */
ve.ui.LinkInspector = function VeUiLinkInspector( context ) {
	// Parent constructor
	ve.ui.Inspector.call( this, context );

	// Properties
	this.context = context;
	this.initialAnnotationHash = null;
	this.isNewAnnotation = false;
	this.targetInput = new this.constructor.static.inputWidget( this.frame.$$, context.$overlay );

	// Initialization
	this.$form.append( this.targetInput.$ );
};

/* Inheritance */

ve.inheritClass( ve.ui.LinkInspector, ve.ui.Inspector );

/* Static properties */

ve.ui.LinkInspector.static.icon = 'link';

ve.ui.LinkInspector.static.titleMessage = 'visualeditor-linkinspector-title';

ve.ui.LinkInspector.static.typePattern = /^link(\/|$)/;

ve.ui.LinkInspector.static.inputWidget = ve.ui.LinkTargetInputWidget;

/* Methods */

/**
 * Handle the inspector being initialized.
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
	var fragment = this.context.getSurface().getModel().getFragment( null, true ),
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
 * Handle the inspector being opened.
 *
 * @method
 */
ve.ui.LinkInspector.prototype.onOpen = function () {
	var fragment = this.context.getSurface().getModel().getFragment( null, true ),
		annotation = this.getMatchingAnnotations( fragment ).get( 0 );

	this.initialAnnotationHash = annotation && annotation.getHash();
	this.targetInput.setAnnotation( annotation );

	// Set focus on the location input
	setTimeout( ve.bind( function () {
		this.targetInput.$.focus().select();
	}, this ) );
};

/**
 * Handle the inspector being opened.
 *
 * @method
 * @param {boolean} remove Annotation should be removed
 */
ve.ui.LinkInspector.prototype.onClose = function ( remove ) {
	var i, len, annotations, selection,
		insert = false,
		undo = false,
		clear = false,
		set = false,
		target = this.targetInput.getValue(),
		annotation = this.targetInput.getAnnotation(),
		surface = this.context.getSurface(),
		fragment = surface.getModel().getFragment( this.initialSelection, false );
	// Undefined annotation causes removal
	if ( !annotation ) {
		remove = true;
	}
	if ( remove ) {
		clear = true;
	} else {
		if ( this.initialSelection.isCollapsed() ) {
			insert = true;
		}
		if ( annotation.getHash() !== this.initialAnnotationHash ) {
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
		fragment = fragment.insertContent( target, false ).adjustRange( -target.length, 0 );

		// Move cursor to the end of the inserted content
		selection = new ve.Range( this.initialSelection.start + target.length );
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
		fragment.annotateContent( 'set', annotation );
	}
	// Selection changes may have occured in the insertion and annotation hullabaloo - restore it
	surface.execute( 'content', 'select', selection || new ve.Range( fragment.getRange().end ) );
	// Reset state
	this.isNewAnnotation = false;
};

/**
 * Get an annotation object from a target.
 *
 * @method
 * @param {string} target Link target
 * @returns {ve.dm.LinkAnnotation}
 */
ve.ui.LinkInspector.prototype.getAnnotationFromTarget = function ( target ) {
	return new ve.dm.LinkAnnotation( { 'href': target } );
};

/* Registration */

ve.ui.inspectorFactory.register( 'link', ve.ui.LinkInspector );
