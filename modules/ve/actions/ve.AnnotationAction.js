/*!
 * VisualEditor AnnotationAction class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Annotate action.
 *
 * @class
 * @extends ve.Action
 * @constructor
 * @param {ve.Surface} surface Surface to act on
 */
ve.AnnotationAction = function VeAnnotationAction( surface ) {
	// Parent constructor
	ve.Action.call( this, surface );
};

/* Inheritance */

ve.inheritClass( ve.AnnotationAction, ve.Action );

/* Static Members */

/**
 * List of allowed methods for this action.
 *
 * @static
 * @property
 */
ve.AnnotationAction.static.methods = ['set', 'clear', 'toggle', 'clearAll'];

/* Methods */

/**
 * Sets a given annotation.
 *
 * @method
 * @param {string} name Annotation name, for example: 'textStyle/bold'
 * @param {Object} [data] Additional annotation data
 */
ve.AnnotationAction.prototype.set = function ( name, data ) {
	this.surface.getModel().getFragment().annotateContent( 'set', name, data );
};

/**
 * Clears a given annotation.
 *
 * @method
 * @param {string} name Annotation name, for example: 'textStyle/bold'
 * @param {Object} [data] Additional annotation data
 */
ve.AnnotationAction.prototype.clear = function ( name, data ) {
	this.surface.getModel().getFragment().annotateContent( 'clear', name, data );
};

/**
 * Toggles a given annotation.
 *
 * If the selected text is completely covered with this annotation already the annotation will be
 * cleared. Otherwise the annotation will be set.
 *
 * @method
 * @param {string} name Annotation name, for example: 'textStyle/bold'
 * @param {Object} [data] Additional annotation data
 */
ve.AnnotationAction.prototype.toggle = function ( name, data ) {
	var fragment = this.surface.getModel().getFragment();
	fragment.annotateContent(
		fragment.getAnnotations().hasAnnotationWithName( name ) ? 'clear' : 'set', name, data
	);
};

/**
 * Clears all annotations.
 *
 * @method
 * @param {String|RegExp} [filter] Annotation name or RegExp that matches types
 */
ve.AnnotationAction.prototype.clearAll = function ( filter ) {
	var i, len, arr,
		fragment = this.surface.getModel().getFragment(),
		annotations = fragment.getAnnotations( true );
	if ( typeof filter === 'string' || filter instanceof RegExp ) {
		annotations = annotations.getAnnotationsByName( filter );
	}
	arr = annotations.get();
	// TODO: Allow multiple annotations to be set or cleared by ve.dm.SurfaceFragment, probably
	// using an annotation set and ideally building a single transaction
	for ( i = 0, len = arr.length; i < len; i++ ) {
		fragment.annotateContent( 'clear', arr[i].name, arr[i].data );
	}
};

/* Registration */

ve.actionFactory.register( 'annotation', ve.AnnotationAction );
