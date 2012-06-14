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
			// In the future we'll probably want to write sHref here but right now
			// Parsoid ignores it anyway so there's no point
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
			subtype = rel.split( ':' )[1] || 'unknown',
			mwattr = element.getAttribute( 'data-mw' ),
			mwdata = $.parseJSON( mwattr ) || {},
			href = element.getAttribute( 'href' ),
			retval = {
				'type': 'link/' + subtype,
				'data': {
					'href': href,
					// For some daft reason sHref is an array
					'title': mwdata.sHref && mwdata.sHref[0] ?
						mwdata.sHref[0] : href
				}
			};
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
