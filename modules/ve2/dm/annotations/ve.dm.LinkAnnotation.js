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
			if ( annotation.data.mw ) {
				link.setAttribute( 'data-mw', annotation.data.mw );
			}
			if ( subType === 'wikiLink' || subType === 'extLink' ) {
				link.setAttribute( 'rel', 'mw:' + subType );
			}
			return link;
		}
	},
	'toDataAnnotation': function( tag, element ) {
		var rel = element.getAttribute( 'rel' ) || '',
			subtype = rel.split( ':' )[1] || 'unknown';
			retval = {
				'type': 'link/' + subtype,
				'data': {
					'href': element.getAttribute( 'href' )
				}
			},
			mwattr = element.getAttribute( 'data-mw' );
		if ( mwattr ) {
			retval.data.mw = mwattr;
		}
		return retval;
	}
};

/* Registration */

ve.dm.annotationFactory.register( 'link', ve.dm.LinkAnnotation );

/* Inheritance */

ve.extendClass( ve.dm.LinkAnnotation, ve.dm.Annotation );
