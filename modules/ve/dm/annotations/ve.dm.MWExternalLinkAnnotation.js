/*!
 * VisualEditor DataModel MWExternalLinkAnnotation class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki external link annotation.
 *
 * Example HTML sources:
 *     <a rel="mw:ExtLink">
 *     <a rel="mw:ExtLink/Numbered">
 *     <a rel="mw:ExtLink/URL">
 *
 * Each example is semantically slightly different, but they don't need special treatment (yet).
 *
 * @class
 * @extends ve.dm.LinkAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.MWExternalLinkAnnotation = function VeDmMWExternalLinkAnnotation( element ) {
	// Parent constructor
	ve.dm.LinkAnnotation.call( this, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWExternalLinkAnnotation, ve.dm.LinkAnnotation );

/* Static Properties */

ve.dm.MWExternalLinkAnnotation.static.name = 'link/MWexternal';

ve.dm.MWExternalLinkAnnotation.static.matchRdfaTypes = [
	'mw:ExtLink', 'mw:ExtLink/Numbered', 'mw:ExtLink/URL'
];

ve.dm.MWExternalLinkAnnotation.static.toDataElement = function ( domElements ) {
	var parentResult = ve.dm.LinkAnnotation.static.toDataElement.apply( this, arguments );
	parentResult.type = 'link/MWexternal';
	parentResult.attributes.rel = domElements[0].getAttribute( 'rel' );
	return parentResult;
};

ve.dm.MWExternalLinkAnnotation.static.toDomElements = function ( dataElement ) {
	var parentResult = ve.dm.LinkAnnotation.static.toDomElements.apply( this, arguments );
	parentResult[0].setAttribute( 'rel', dataElement.attributes.rel || 'mw:ExtLink' );
	return parentResult;
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWExternalLinkAnnotation );
