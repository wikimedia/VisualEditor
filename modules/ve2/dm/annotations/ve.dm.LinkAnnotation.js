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
	'domElementTypes': ['a'],
	'toDomElement': function( subType, annotation ) {
		if ( annotation.type ) {
			var link = document.createElement( 'a' );
			link.setAttribute( 'href', annotation.data.href );
			link.setAttribute( 'data-mw', annotation.data.mw );
			if ( subType === 'wikiLink' || subType === 'extLink' ) {
				link.setAttribute( 'rel', 'mw:' + subType );
			}
			return link;
		}
	},
	'toDataAnnotation': function( tag, element ) {
		return {
			'type': 'link/' + ( element.getAttribute( 'rel' ).split( ':' )[1] || 'unknown' ),
			'data': {
				'href': element.getAttribute( 'href' ),
				'mw': element.getAttribute( 'data-mw' )
			}
		};
	}
};

/* Registration */

ve.dm.annotationFactory.register( 'link', ve.dm.LinkAnnotation );

/* Inheritance */

ve.extendClass( ve.dm.LinkAnnotation, ve.dm.Annotation );
