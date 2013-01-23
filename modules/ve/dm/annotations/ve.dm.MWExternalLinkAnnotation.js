/*!
 * VisualEditor DataModel MWExternalLinkAnnotation class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
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
 * Each example is semantically slightly different, but don't need special treatment (yet).
 *
 * @class
 * @extends ve.dm.LinkAnnotation
 * @constructor
 * @param {HTMLElement|Object} element
 */
ve.dm.MWExternalLinkAnnotation = function VeDmMWExternalLinkAnnotation( element ) {
	// Parent constructor
	ve.dm.LinkAnnotation.call( this, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWExternalLinkAnnotation, ve.dm.LinkAnnotation );

/* Static Properties */

/**
 * @static
 * @property static.name
 * @inheritdoc
 */
ve.dm.MWExternalLinkAnnotation.static.name = 'link/MWexternal';

/**
 * @static
 * @property static.matchTagNames
 * @inheritdoc
 */
ve.dm.MWExternalLinkAnnotation.static.matchRdfaTypes = [
	'mw:ExtLink', 'mw:ExtLink/Numbered', 'mw:ExtLink/URL'
];

/**
 * Convert to an object with HTML element information.
 *
 * @method
 * @returns {Object} HTML element information, including tag and attributes properties
 */
ve.dm.MWExternalLinkAnnotation.prototype.toHTML = function () {
	var parentResult = ve.dm.LinkAnnotation.prototype.toHTML.call( this );
	parentResult.attributes.rel = parentResult.attributes.rel || 'mw:ExtLink';
	return parentResult;
};

ve.dm.MWExternalLinkAnnotation.prototype.renderHTML = function () {
	var result = this.toHTML();
	result.attributes.title = this.data.href;
	return result;
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWExternalLinkAnnotation );
