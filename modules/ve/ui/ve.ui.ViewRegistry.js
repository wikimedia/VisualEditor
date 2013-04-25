/*!
 * VisualEditor UserInterface ViewRegistry class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface view registry.
 *
 * @class
 * @extends ve.Registry
 *
 * @constructor
 */
ve.ui.ViewRegistry = function VeUiViewRegistry() {
	// Parent constructor
	ve.Registry.call( this );
};

/* Inheritance */

ve.inheritClass( ve.ui.ViewRegistry, ve.Registry );

/* Methods */

ve.ui.ViewRegistry.prototype.isViewRelatedToModel = function ( view, model ) {
	var classes = view.static.modelClasses || [],
		i = classes.length;

	while ( classes[--i] ) {
		if ( model instanceof classes[i] ) {
			return true;
		}
	}
	return false;
};

/**
 * Get a list of views from a set of annotations.
 *
 * The most specific view will be chosen based on inheritance - mostly. The order of being added
 * also matters if the candidate classes aren't all in the same inheritance chain, and since object
 * properties aren't necessarily ordered it's not predictable what the effect of ordering will be.
 *
 * TODO: Add tracking of order of registration using an array and prioritize the most recently
 * registered candidate.
 *
 * @method
 * @param {ve.dm.AnnotationSet} annotations Annotations to be inspected
 * @returns {string[]} Symbolic names of views that can be used to inspect annotations
 */
ve.ui.ViewRegistry.prototype.getViewsForAnnotations = function ( annotations ) {
	if ( annotations.isEmpty() ) {
		return [];
	}

	var i, len, annotation, name, view, candidateView, candidateViewName,
		arr = annotations.get(),
		matches = [];

	for ( i = 0, len = arr.length; i < len; i++ ) {
		annotation = arr[i];
		candidateView = null;
		for ( name in this.registry ) {
			view = this.registry[name];
			if ( this.isViewRelatedToModel( view, annotation ) ) {
				if ( !candidateView || view.prototype instanceof candidateView ) {
					candidateView = view;
					candidateViewName = name;
				}
			}
		}
		if ( candidateView ) {
			matches.push( candidateViewName );
		}
	}
	return matches;
};

/**
 * Get a view for a node.
 *
 * The most specific view will be chosen based on inheritance - mostly. The order of being added
 * also matters if the candidate classes aren't all in the same inheritance chain, and since object
 * properties aren't necessarily ordered it's not predictable what the effect of ordering will be.
 *
 * TODO: Add tracking of order of registration using an array and prioritize the most recently
 * registered candidate.
 *
 * @method
 * @param {ve.dm.Node} node Node to be edited
 * @returns {string|undefined} Symbolic name of view that can be used to edit node
 */
ve.ui.ViewRegistry.prototype.getViewForNode = function ( node ) {
	var name, view, candidateView, candidateViewName;

	for ( name in this.registry ) {
		view = this.registry[name];
		if ( this.isViewRelatedToModel( view, node ) ) {
			if ( !candidateView || view.prototype instanceof candidateView ) {
				candidateView = view;
				candidateViewName = name;
			}
		}
	}
	return candidateViewName;
};

/* Initialization */

ve.ui.viewRegistry = new ve.ui.ViewRegistry();
