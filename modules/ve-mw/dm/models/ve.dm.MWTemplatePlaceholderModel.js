/*!
 * VisualEditor DataModel MWTemplatePlaceholderModel class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * MediaWiki template placeholder model.
 *
 * @class
 * @extends ve.dm.MWTransclusionPartModel
 *
 * @constructor
 * @param {ve.dm.MWTransclusionModel} transclusion Transclusion
 * @param {string} [origin] Origin of part, e.g. 'data' or 'user'
 */
ve.dm.MWTemplatePlaceholderModel = function VeDmMWTemplatePlaceholderModel( transclusion, origin ) {
	// Parent constructor
	ve.dm.MWTransclusionPartModel.call( this, transclusion, origin );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWTemplatePlaceholderModel, ve.dm.MWTransclusionPartModel );
