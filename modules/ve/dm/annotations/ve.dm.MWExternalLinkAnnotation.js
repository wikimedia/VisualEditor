/**
 * VisualEditor data model MWExternalLinkAnnotation class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Annotation representing an external link in MediaWiki, i.e. <a rel="mw:ExtLink">,
 * <a rel="mw:ExtLink/Numbered"> and <a rel="mw:ExtLink/URL">. Those three are semantically
 * slightly different, but they don't need to be treated differently by us, at least for now.
 */
ve.dm.MWExternalLinkAnnotation = function VeDmMWExternalLinkAnnotation( element ) {
	ve.dm.LinkAnnotation.call( this, element );
};

ve.inheritClass( ve.dm.MWExternalLinkAnnotation, ve.dm.LinkAnnotation );

ve.dm.MWExternalLinkAnnotation.static.name = 'link/MWexternal';
ve.dm.MWExternalLinkAnnotation.static.matchRdfaTypes = ['mw:ExtLink', 'mw:ExtLink/Numbered', 'mw:ExtLink/URL'];

ve.dm.MWExternalLinkAnnotation.prototype.toHTML = function () {
	var parentResult = ve.dm.LinkAnnotation.prototype.toHTML.call( this );
	parentResult.attributes.rel = parentResult.attributes.rel || 'mw:ExtLink';
	return parentResult;
};

ve.dm.annotationFactory.register( 'link/MWexternal', ve.dm.MWExternalLinkAnnotation );
