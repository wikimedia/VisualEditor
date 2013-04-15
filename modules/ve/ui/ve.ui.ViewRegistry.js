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
 * @method
 * @param {ve.dm.AnnotationSet} annotations Annotations to be inspected
 * @returns {string[]} Symbolic names of views that can be used to inspect annotations
 */
ve.ui.ViewRegistry.prototype.getViewsForAnnotations = function ( annotations ) {
	if ( annotations.isEmpty() ) {
		return [];
	}

	var i, len, annotation, name, view,
		arr = annotations.get(),
		matches = [];

	for ( i = 0, len = arr.length; i < len; i++ ) {
		annotation = arr[i];
		for ( name in this.registry ) {
			view = this.registry[name];
			if ( this.isViewRelatedToModel( view, annotation ) ) {
				matches.push( name );
				break;
			}
		}
	}
	return matches;
};

/**
 * Get a list of views for a node.
 *
 * @method
 * @param {ve.dm.Node} node Node to be edited
 * @returns {string[]} Symbolic names of views that can be used to edit node
 */
ve.ui.ViewRegistry.prototype.getViewsForNode = function ( node ) {
	var name, view,
		matches = [];

	for ( name in this.registry ) {
		view = this.registry[name];
		if ( this.isViewRelatedToModel( view, node ) ) {
			matches.push( name );
			break;
		}
	}
	return matches;
};

/* Initialization */

ve.ui.viewRegistry = new ve.ui.ViewRegistry();
