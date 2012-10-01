/**
 * VisualEditor data model MWInternalLinkAnnotation class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Annotation representing an internal link in MediaWiki, i.e. <a rel="mw:WikiLink">
 */
ve.dm.MWInternalLinkAnnotation = function VeDmMWInternalLinkAnnotation( element ) {
	ve.dm.LinkAnnotation.call( this, element );
};

ve.inheritClass( ve.dm.MWInternalLinkAnnotation, ve.dm.LinkAnnotation );

ve.dm.MWInternalLinkAnnotation.static.name = 'link/MWinternal';
ve.dm.MWInternalLinkAnnotation.static.matchRdfaTypes = ['mw:WikiLink'];

ve.dm.MWInternalLinkAnnotation.prototype.getAnnotationData = function( element ) {
	// Get title from href
	// The href is simply the title, unless we're dealing with a page that
	// has slashes in its name in which case it's preceded by one or more
	// instances of "./" or "../", so strip those.
	var matches = element.getAttribute( 'href' ).match( /^((?:\.\.?\/)*)(.*)$/ );
	return {
		// Store the ./ and ../ prefixes so we can restore them on the way out
		'hrefPrefix': matches[1],
		'title': matches[2].replace( /_/g, ' ' )
	};
};

ve.dm.MWInternalLinkAnnotation.prototype.toHTML = function () {
	var href,
		parentResult = ve.dm.LinkAnnotation.prototype.toHTML.call( this );
	// Set href to title
	href = this.data.title.replace( / /g, '_' );
	if ( this.data.hrefPrefix ) {
		href = this.data.hrefPrefix + href;
	}
	parentResult.attributes.href = href;
	parentResult.attributes.rel = 'mw:WikiLink';
	return parentResult;
};

ve.dm.annotationFactory.register( 'link/MWinternal', ve.dm.MWInternalLinkAnnotation );
