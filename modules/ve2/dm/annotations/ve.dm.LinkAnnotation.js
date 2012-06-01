/**
 * DataModel annotation for a link.
 *
 * @class
 * @constructor
 * @extends {ve.dm.Annotation}
 */
ve.dm.LinkAnnotation = function() {
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
ve.dm.LinkAnnotation.converters = {
	'tags': 'a',
	'toHtml': function( subType, annotation ) {
		return annotation.type &&
			ve.dm.createHtmlElement( 'a', { 'data-type': 'link/' + subType } );
	},
	'toData': function( tag, element ) {
		// FIXME: the parser currently doesn't output this data this way
		// Internal links get 'linkType': 'internal' in the data-mw-rt attrib, while external
		// links currently get nothing
		return { 'type': 'link/' + ( element.getAttribute( 'data-type' ) || 'unknown' ) };
	}
};

/* Registration */

ve.dm.annotationFactory.register( 'link', ve.dm.LinkAnnotation );

/* Inheritance */

ve.extendClass( ve.dm.LinkAnnotation, ve.dm.Annotation );
