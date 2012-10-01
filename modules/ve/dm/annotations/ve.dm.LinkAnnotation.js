/**
 * VisualEditor data model LinkAnnotation class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic link annotation. Represents <a> tags that don't have a specific type.
 */
ve.dm.LinkAnnotation = function VeDmLinkAnnotation( element ) {
	ve.dm.Annotation.call( this, element );
};

ve.inheritClass( ve.dm.LinkAnnotation, ve.dm.Annotation );

ve.dm.LinkAnnotation.static.name = 'link';
ve.dm.LinkAnnotation.static.matchTagNames = ['a'];

ve.dm.LinkAnnotation.prototype.getAnnotationData = function( element ) {
	return { 'href': element.getAttribute( 'href' ) };
};

ve.dm.LinkAnnotation.prototype.toHTML = function () {
	var parentResult = ve.dm.Annotation.prototype.toHTML.call( this );
	parentResult.tag = 'a';
	parentResult.attributes.href = this.data.href;
	return parentResult;
};

ve.dm.annotationFactory.register( 'link', ve.dm.LinkAnnotation );
