/**
 * VisualEditor data model LinkAnnotation class.
 * 
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

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
		var link = document.createElement( 'a' );
		if ( subType === 'wikiLink' ) {
			link.setAttribute( 'rel', 'mw:wikiLink' );
			// Set href to /title
			link.setAttribute( 'href', '/' + annotation.data.title );
		} else if ( subType === 'extLink' ) {
			link.setAttribute( 'rel', 'mw:extLink' );
			link.setAttribute( 'href', annotation.data.href );
		}
		if ( annotation.data.mw ) {
			link.setAttribute( 'data-mw', annotation.data.mw );
		}
		return link;
	},
	'toDataAnnotation': function( tag, element ) {
		var rel = element.getAttribute( 'rel' ) || '',
			subType = rel.split( ':' )[1] || 'unknown',
			mwattr = element.getAttribute( 'data-mw' ),
			mwdata = $.parseJSON( mwattr ) || {},
			href = element.getAttribute( 'href' ),
			retval = {
				'type': 'link/' + subType,
				'data': {}
			};
		if ( subType === 'wikiLink' ) {
			retval.data.title = mwdata.sHref ||
				// Trim leading slash from href
				href.replace( /^\//, '' );
		} else if ( subType === 'extLink' ) {
			retval.data.href = href;
		}
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
