/**
 * DataModel annotation factory.
 *
 * @class
 * @extends {ve.Factory}
 * @constructor
 */
ve.dm.AnnotationFactory = function() {
	// Inheritance
	ve.Factory.call( this );
};

/* Inheritance */

ve.extendClass( ve.dm.AnnotationFactory, ve.Factory );

/* Initialization */

ve.dm.annotationFactory = new ve.dm.AnnotationFactory();
