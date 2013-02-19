/*!
 * VisualEditor DataModel AnnotationFactory class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel annotation factory.
 *
 * @class
 * @extends ve.Factory
 * @constructor
 */
ve.dm.AnnotationFactory = function VeDmAnnotationFactory() {
	// Parent constructor
	ve.Factory.call( this );
};

/* Inheritance */

ve.inheritClass( ve.dm.AnnotationFactory, ve.Factory );

/* Methods */

// TODO provided for backwards compatibility, this should go away
ve.dm.AnnotationFactory.prototype.createFromElement = function ( element ) {
	var name = ve.dm.modelRegistry.matchElement( element );
	if ( name === null || !( name in this.registry ) ) {
		return null;
	} else {
		return this.create( name, element );
	}
};

/* Initialization */

ve.dm.annotationFactory = new ve.dm.AnnotationFactory();
