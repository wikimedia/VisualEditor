/*!
 * VisualEditor UserInterface LinkAnnotationInspector class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Inspector for linked content.
 *
 * @class
 * @extends ve.ui.AnnotationInspector
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.LinkAnnotationInspector = function VeUiLinkAnnotationInspector( config ) {
	// Parent constructor
	ve.ui.AnnotationInspector.call( this, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.LinkAnnotationInspector, ve.ui.AnnotationInspector );

/* Static properties */

ve.ui.LinkAnnotationInspector.static.name = 'link';

ve.ui.LinkAnnotationInspector.static.title = OO.ui.deferMsg( 'visualeditor-linkinspector-title' );

ve.ui.LinkAnnotationInspector.static.modelClasses = [ ve.dm.LinkAnnotation ];

/* Methods */

/**
 * Handle annotation input change events
 *
 * @param {ve.dm.LinkAnnotation} annotation New link annotation value
 */
ve.ui.LinkAnnotationInspector.prototype.onAnnotationInputChange = function () {
	this.updateActions();
};

/**
 * Update the actions based on the annotation state
 */
ve.ui.LinkAnnotationInspector.prototype.updateActions = function () {
	var inspector = this,
		annotation = this.annotationInput.getAnnotation();

	this.annotationInput.getTextInputWidget().isValid().done( function ( isValid ) {
		isValid = isValid && !!annotation;
		inspector.actions.forEach( { actions: [ 'done', 'insert' ] }, function ( action ) {
			action.setDisabled( !isValid );
		} );
	} );

};

/**
 * @inheritdoc
 */
ve.ui.LinkAnnotationInspector.prototype.shouldRemoveAnnotation = function () {
	return !this.annotationInput.getAnnotation();
};

/**
 * @inheritdoc
 */
ve.ui.LinkAnnotationInspector.prototype.getInsertionText = function () {
	return this.annotationInput.getHref();
};

/**
 * @inheritdoc
 */
ve.ui.LinkAnnotationInspector.prototype.getAnnotation = function () {
	return this.annotationInput.getAnnotation();
};

/**
 * @inheritdoc
 */
ve.ui.LinkAnnotationInspector.prototype.getAnnotationFromFragment = function ( fragment ) {
	var text = fragment.getText();

	return text ? new ve.dm.LinkAnnotation( {
		type: 'link',
		attributes: { href: fragment.getText() }
	} ) : null;
};

/**
 * @inheritdoc
 */
ve.ui.LinkAnnotationInspector.prototype.initialize = function () {
	// Parent method
	ve.ui.LinkAnnotationInspector.super.prototype.initialize.call( this );

	// Properties
	this.annotationInput = this.createAnnotationInput();

	// Events
	this.annotationInput.connect( this, { change: 'onAnnotationInputChange' } );

	// Initialization
	this.form.$element.append( this.annotationInput.$element );
};

/**
 * Create a link annotation widget
 *
 * @return {ve.ui.LinkAnnotationWidget} Link annotation widget
 */
ve.ui.LinkAnnotationInspector.prototype.createAnnotationInput = function () {
	return new ve.ui.LinkAnnotationWidget();
};

/**
 * @inheritdoc
 */
ve.ui.LinkAnnotationInspector.prototype.getSetupProcess = function ( data ) {
	return ve.ui.LinkAnnotationInspector.super.prototype.getSetupProcess.call( this, data )
		.next( function () {
			// Disable surface until animation is complete; will be reenabled in ready()
			this.getFragment().getSurface().disable();
			this.annotationInput.setAnnotation( this.initialAnnotation );
			this.updateActions();
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.LinkAnnotationInspector.prototype.getReadyProcess = function ( data ) {
	return ve.ui.LinkAnnotationInspector.super.prototype.getReadyProcess.call( this, data )
		.next( function () {
			this.annotationInput.getTextInputWidget().focus().select();
			this.getFragment().getSurface().enable();

			// Clear validation state, so that we don't get "invalid" state immediately on focus
			this.annotationInput.getTextInputWidget().setValidityFlag( true );
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.LinkAnnotationInspector.prototype.getHoldProcess = function ( data ) {
	return ve.ui.LinkAnnotationInspector.super.prototype.getHoldProcess.call( this, data )
		.next( function () {
			this.annotationInput.getTextInputWidget().blur();
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.LinkAnnotationInspector.prototype.getTeardownProcess = function ( data ) {
	return ve.ui.LinkAnnotationInspector.super.prototype.getTeardownProcess.call( this, data )
		.next( function () {
			this.annotationInput.setAnnotation( null );
		}, this );
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.LinkAnnotationInspector );
