/*!
 * VisualEditor DataModel MWInternalLinkAnnotation class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki internal link annotation.
 *
 * Example HTML sources:
 *     <a rel="mw:WikiLink">
 *
 * @class
 * @extends ve.dm.LinkAnnotation
 * @constructor
 * @param {HTMLElement} element
 */
ve.dm.MWInternalLinkAnnotation = function VeDmMWInternalLinkAnnotation( element ) {
	// Parent constructor
	ve.dm.LinkAnnotation.call( this, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWInternalLinkAnnotation, ve.dm.LinkAnnotation );

/* Static Properties */

/**
 * @static
 * @property static.name
 * @inheritdoc
 */
ve.dm.MWInternalLinkAnnotation.static.name = 'link/MWinternal';

/**
 * @static
 * @property static.matchTagNames
 * @inheritdoc
 */
ve.dm.MWInternalLinkAnnotation.static.matchRdfaTypes = ['mw:WikiLink'];

/* Methods */

/**
 * Get annotation data, especially the href of the link.
 *
 * @method
 * @param {HTMLElement} element
 * @returns {Object} Annotation data, containing 'hrefPrefix' and 'title' properties
 */
ve.dm.MWInternalLinkAnnotation.prototype.getAnnotationData = function ( element ) {
	// Get title from href
	// The href is simply the title, unless we're dealing with a page that has slashes in its name
	// in which case it's preceded by one or more instances of "./" or "../", so strip those
	/*jshint regexp:false */
	var matches = element.getAttribute( 'href' ).match( /^((?:\.\.?\/)*)(.*)$/ );
	return {
		// Store the ./ and ../ prefixes so we can restore them on the way out
		'hrefPrefix': matches[1],
		'title': decodeURIComponent( matches[2] ).replace( /_/g, ' ' ),
		'origTitle': matches[2]
	};
};

/**
 * Convert to an object with HTML element information.
 *
 * @method
 * @returns {Object} HTML element information, including tag and attributes properties
 */
ve.dm.MWInternalLinkAnnotation.prototype.toHTML = function () {
	var	href,
		parentResult = ve.dm.LinkAnnotation.prototype.toHTML.call( this );
	if (
		this.data.origTitle &&
		decodeURIComponent( this.data.origTitle ).replace( /_/g, ' ' ) === this.data.title
	) {
		// Restore href from origTitle
		href = this.data.origTitle;
		// Only use hrefPrefix if restoring from origTitle
		if ( this.data.hrefPrefix ) {
			href = this.data.hrefPrefix + href;
		}
	} else {
		href = encodeURIComponent( this.data.title );
	}
	parentResult.attributes.href = href;
	parentResult.attributes.rel = 'mw:WikiLink';
	return parentResult;
};

ve.dm.MWInternalLinkAnnotation.prototype.renderHTML = function () {
	var result = this.toHTML();
	result.attributes.title = this.data.title;
	return result;
};

/* Registration */

ve.dm.annotationFactory.register( 'link/MWinternal', ve.dm.MWInternalLinkAnnotation );
