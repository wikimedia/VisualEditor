/**
 * DataModel annotation for a object.
 *
 * @class
 * @constructor
 * @extends {ve.dm.Annotation}
 */
ve.dm.ObjectAnnotation = function() {
	// Inheritance
	ve.dm.Annotation.call( this );
};

/* Static Members */

/**
 * Converters.
 *
 * @see {ve.dm.Converter}
 * @static
 * @member
 */
ve.dm.ObjectAnnotation.converters = {
	'tags': ['template', 'hook'],
	'html': {
		'convert': function( subType, annotation ) {
			return annotation.type &&
				ve.dm.createHtmlElement( 'div', { 'data-type': subType } );
		}
	},
	'data': {
		'convert': function( tag, element ) {
			return { 'type': 'object/' + ( element.getAttribute( 'data-type' ) || 'unknown' ) };
		}
	}
};

/* Registration */

ve.dm.annotationFactory.register( 'object', ve.dm.ObjectAnnotation );

/* Inheritance */

ve.extendClass( ve.dm.ObjectAnnotation, ve.dm.Annotation );
