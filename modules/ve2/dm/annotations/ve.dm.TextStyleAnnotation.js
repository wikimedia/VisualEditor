/**
 * DataModel annotation for a text style.
 *
 * @class
 * @constructor
 * @extends {ve.dm.Annotation}
 */
ve.dm.TextStyleAnnotation = function() {
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
ve.dm.TextStyleAnnotation.converters = {
	'tags': ['i', 'b', 'u', 's', 'small', 'big', 'span'],
	'toHtml': function( subType, annotation ) {
		return annotation.type && ve.dm.createHtmlElement( ( {
			'italic': 'i',
			'bold': 'b',
			'underline': 'u',
			'strike': 's',
			'small': 'small',
			'big': 'big',
			'span': 'span'
			// TODO: Add other supported HTML inline elements to this list
		} )[subType] );
	},
	'toData': function( tag, element ) {
		return {
			'type': 'textStyle/' + ( {
				'i': 'italic',
				'b': 'bold',
				'u': 'underline',
				's': 'strike',
				'small': 'small',
				'big': 'big',
				'span': 'span'
				// TODO: Add other supported HTML inline elements to this list
			} )[tag]
		};
	}
};

/* Registration */

ve.dm.annotationFactory.register( 'textStyle', ve.dm.TextStyleAnnotation );

/* Inheritance */

ve.extendClass( ve.dm.TextStyleAnnotation, ve.dm.Annotation );
