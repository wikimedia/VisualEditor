/*!
 * VisualEditor AnnotationContextItem class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Context item for an annotation.
 *
 * @class
 * @abstract
 * @extends ve.ui.LinearContextItem
 *
 * @param {ve.ui.Context} context Context item is in
 * @param {ve.dm.Model} model Model item is related to
 * @param {Object} config Configuration options
 */
ve.ui.AnnotationContextItem = function VeUiAnnotationContextItem( context, model, config ) {
	// Parent constructor
	ve.ui.AnnotationContextItem.super.call( this, context, model, config );

	// Initialization
	this.$element.addClass( 've-ui-annotationContextItem' );

	if ( !this.context.isMobile() ) {
		this.clearButton = new OO.ui.ButtonWidget( {
			title: this.constructor.static.clearMsg,
			icon: this.constructor.static.clearIcon,
			flags: [ 'destructive' ]
		} );
	} else {
		this.clearButton = new OO.ui.ButtonWidget( {
			framed: false,
			icon: this.constructor.static.clearIcon,
			flags: [ 'destructive' ]
		} );
	}
	if ( this.isClearable() ) {
		this.actionButtons.addItems( [ this.clearButton ], 0 );
	}
	this.clearButton.connect( this, { click: 'onClearButtonClick' } );
};

/* Inheritance */

OO.inheritClass( ve.ui.AnnotationContextItem, ve.ui.LinearContextItem );

/* Static Properties */

ve.ui.AnnotationContextItem.static.clearable = true;
ve.ui.AnnotationContextItem.static.clearIcon = 'cancel';
ve.ui.AnnotationContextItem.static.clearMsg = OO.ui.deferMsg( 'visualeditor-clearbutton-tooltip' );

/* Methods */

/**
 * Check if item is clearable.
 *
 * @return {boolean} Item is clearable
 */
ve.ui.AnnotationContextItem.prototype.isClearable = function () {
	return this.constructor.static.clearable;
};

/**
 * Handle clear button click events.
 *
 * @localdoc Removes any modelClasses annotations from the current fragment
 *
 * @protected
 */
ve.ui.AnnotationContextItem.prototype.onClearButtonClick = function () {
	this.applyToAnnotations( function ( fragment, annotation ) {
		fragment.annotateContent( 'clear', annotation );
	} );
};

/**
 * Apply a callback to every modelClass annotation in the current fragment
 *
 * @param  {Function} callback Callback, will be passed fragment and annotation
 */
ve.ui.AnnotationContextItem.prototype.applyToAnnotations = function ( callback ) {
	var i, len,
		modelClasses = this.constructor.static.modelClasses,
		fragment = this.getFragment(),
		annotations = fragment.getAnnotations( true ).filter( function ( annotation ) {
			return ve.isInstanceOfAny( annotation, modelClasses );
		} ).get();
	if (
		!annotations.length &&
		fragment.getSelection().isCollapsed() &&
		fragment.getDocument().data.isContentOffset( fragment.getSelection().getRange().start )
	) {
		// Expand to nearest word and try again
		fragment = fragment.expandLinearSelection( 'word' );

		annotations = fragment.getAnnotations( true ).filter( function ( annotation ) {
			return ve.isInstanceOfAny( annotation, modelClasses );
		} ).get();
	}
	for ( i = 0, len = annotations.length; i < len; i++ ) {
		callback( fragment.expandLinearSelection( 'annotation', annotations[ i ] ), annotations[ i ] );
	}
};
