/*!
 * VisualEditor UserInterface AnnotationInspector class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Annotation inspector.
 *
 * @class
 * @abstract
 * @extends ve.ui.Inspector
 *
 * @constructor
 * @param {ve.ui.WindowSet} windowSet Window set this inspector is part of
 * @param {Object} [config] Configuration options
 */
ve.ui.AnnotationInspector = function VeUiAnnotationInspector( windowSet, config ) {
	// Parent constructor
	ve.ui.Inspector.call( this, windowSet, config );

	// Properties
	this.previousSelection = null;
	this.initialSelection = null;
	this.initialAnnotation = null;
	this.initialAnnotationHash = null;
	this.isNewAnnotation = false;
};

/* Inheritance */

OO.inheritClass( ve.ui.AnnotationInspector, ve.ui.Inspector );

/**
 * Annotation models this inspector can edit.
 *
 * @static
 * @inheritable
 * @property {Function[]}
 */
ve.ui.AnnotationInspector.static.modelClasses = [];

/* Methods */

/**
 * Check if form is empty, which if saved should result in removing the annotation.
 *
 * Only override this if the form provides the user a way to blank out primary information, allowing
 * them to remove the annotation by clearing the form.
 *
 * @returns {boolean} Form is empty
 */
ve.ui.AnnotationInspector.prototype.shouldRemoveAnnotation = function () {
	return false;
};

/**
 * Get text to insert if no text was selected when the inspector opened.
 *
 * @returns {string} Text to insert
 */
ve.ui.AnnotationInspector.prototype.getInsertionText = function () {
	return '';
};

/**
 * Get the annotation object to apply.
 *
 * This method is called when the inspector is closing, and should return the annotation to apply
 * to the text. If this method returns a falsey value like null, no annotation will be applied,
 * but existing annotations won't be removed either.
 *
 * @abstract
 * @returns {ve.dm.Annotation} Annotation to apply
 * @throws {Error} If not overridden in subclass
 */
ve.ui.AnnotationInspector.prototype.getAnnotation = function () {
	throw new Error(
		've.ui.AnnotationInspector.getAnnotation not implemented in subclass'
	);
};

/**
 * Get an annotation object from a fragment.
 *
 * @method
 * @abstract
 * @param {ve.dm.SurfaceFragment} fragment Surface fragment
 * @returns {ve.dm.Annotation} Annotation
 * @throws {Error} If not overriden in a subclass
 */
ve.ui.AnnotationInspector.prototype.getAnnotationFromFragment = function () {
	throw new Error(
		've.ui.AnnotationInspector.getAnnotationFromFragment not implemented in subclass'
	);
};

/**
 * Get matching annotations within a fragment.
 *
 * @method
 * @param {ve.dm.SurfaceFragment} fragment Fragment to get matching annotations within
 * @param {boolean} [all] Get annotations which only cover some of the fragment
 * @returns {ve.dm.AnnotationSet} Matching annotations
 */
ve.ui.AnnotationInspector.prototype.getMatchingAnnotations = function ( fragment, all ) {
	var modelClasses = this.constructor.static.modelClasses;

	return fragment.getAnnotations( all ).filter( function ( annnotation ) {
		return ve.isInstanceOfAny( annnotation, modelClasses );
	} );
};

/**
 * Handle the inspector being setup.
 *
 * There are 4 scenarios:
 * - Zero-length selection not near a word -> no change, text will be inserted on close
 * - Zero-length selection inside or adjacent to a word -> expand selection to cover word
 * - Selection covering non-annotated text -> trim selection to remove leading/trailing whitespace
 * - Selection covering annotated text -> expand selection to cover annotation
 *
 * @method
 * @param {Object} [data] Inspector opening data
 */
ve.ui.AnnotationInspector.prototype.setup = function ( data ) {
	// Parent method
	ve.ui.Inspector.prototype.setup.call( this, data );

	var expandedFragment, trimmedFragment, truncatedFragment,
		fragment = this.surface.getModel().getFragment( null, true ),
		annotation = this.getMatchingAnnotations( fragment, true ).get( 0 );

	this.previousSelection = this.surface.getModel().getSelection();

	// Initialize range
	if ( !annotation ) {
		if (
			fragment.getRange().isCollapsed() &&
			!this.surface.view.hasSlugAtOffset( fragment.getRange().start )
		) {
			// Expand to nearest word
			expandedFragment = fragment.expandRange( 'word' );
			fragment = expandedFragment;
		} else {
			// Trim whitespace
			trimmedFragment = fragment.trimRange();
			fragment = trimmedFragment;
		}
		if ( !fragment.getRange().isCollapsed() ) {
			// Create annotation from selection
			truncatedFragment = fragment.truncateRange( 255 );
			fragment = truncatedFragment;
			annotation = this.getAnnotationFromFragment( fragment );
			if ( annotation ) {
				fragment.annotateContent( 'set', annotation );
			}
			this.isNewAnnotation = true;
		}
	} else {
		// Expand range to cover annotation
		expandedFragment = fragment.expandRange( 'annotation', annotation );
		fragment = expandedFragment;
	}

	// Update selection
	fragment.select();
	this.initialSelection = fragment.getRange();

	// Note we don't set the 'all' flag here - any non-annotated content will be annotated on close
	this.initialAnnotation = this.getMatchingAnnotations( fragment ).get( 0 );
	// Fallback to a default annotation
	if ( !this.initialAnnotation ) {
		this.initialAnnotation = this.getAnnotationFromFragment( fragment );
	}
	this.initialAnnotationHash = this.initialAnnotation ?
		OO.getHash( this.initialAnnotation.getComparableObject() ) : null;
};

/**
 * @inheritdoc
 */
ve.ui.AnnotationInspector.prototype.teardown = function ( data ) {
	// Configuration initialization
	data = data || {};

	var i, len, annotations, insertion,
		add = false,
		insert = false,
		undo = false,
		clear = false,
		set = false,
		annotation = this.getAnnotation(),
		remove = this.shouldRemoveAnnotation() || data.action === 'remove',
		surfaceModel = this.surface.getModel(),
		fragment = surfaceModel.getFragment( this.initialSelection, false ),
		selection = surfaceModel.getSelection();

	if ( remove ) {
		clear = true;
	} else if ( annotation ) {
		if ( this.initialSelection.isCollapsed() ) {
			insert = true;
		}
		if ( OO.getHash( annotation.getComparableObject() ) !== this.initialAnnotationHash ) {
			if ( this.isNewAnnotation ) {
				undo = true;
			} else {
				clear = true;
			}
			set = true;
		}
	}
	if ( insert ) {
		insertion = this.getInsertionText();
		if ( insertion.length ) {
			fragment.insertContent( insertion, false );
			// Move cursor to the end of the inserted content, even if back button is used
			fragment.adjustRange( -insertion.length, 0 );
			this.previousSelection = new ve.Range( this.initialSelection.start + insertion.length );
		}
	}
	if ( undo ) {
		// Go back to before we added an annotation
		this.surface.execute( 'history', 'undo' );
	}
	if ( clear ) {
		// Clear all existing annotations
		annotations = this.getMatchingAnnotations( fragment, true ).get();
		for ( i = 0, len = annotations.length; i < len; i++ ) {
			fragment.annotateContent( 'clear', annotations[i] );
		}
	}
	if ( set && annotation ) {
		// Apply new annotation
		if ( fragment.getRange().isCollapsed() ) {
			add = true;
		} else {
			fragment.annotateContent( 'set', annotation );
		}
	}
	if ( data.action === 'back' || insert ) {
		// Restore selection to what it was before we expanded it
		selection = this.previousSelection;
	}
	this.surface.execute( 'content', 'select', selection );

	if ( add ) {
		surfaceModel.addInsertionAnnotations( annotation );
	}

	// Reset state
	this.isNewAnnotation = false;

	// Parent method
	ve.ui.Inspector.prototype.teardown.call( this, data );
};
