/**
 * VisualEditor data model AnnotationFactory class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel annotation factory.
 *
 * @class
 * @constructor
 * @extends {ve.Factory}
 */
ve.dm.AnnotationFactory = function ve_dm_AnnotationFactory() {
	// Parent constructor
	ve.Factory.call( this );
};

/* Inheritance */

ve.inheritClass( ve.dm.AnnotationFactory, ve.Factory );

/* Initialization */

ve.dm.annotationFactory = new ve.dm.AnnotationFactory();
