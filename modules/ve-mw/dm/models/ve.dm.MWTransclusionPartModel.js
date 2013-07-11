/*!
 * VisualEditor DataModel MWTransclusionPartModel class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * MediaWiki transclusion part model.
 *
 * @class
 * @mixins ve.EventEmitter
 *
 * @constructor
 * @param {ve.dm.MWTransclusionModel} transclusion Transclusion
 * @param {string} [origin] Origin of part, e.g. 'data' or 'user'
 */
ve.dm.MWTransclusionPartModel = function VeDmMWTransclusionPartModel( transclusion, origin ) {
	// Mixin constructors
	ve.EventEmitter.call( this );

	// Properties
	this.transclusion = transclusion;
	this.origin = origin;
	this.id = 'part_' + this.transclusion.getUniquePartId();
};

/* Inheritance */

ve.mixinClass( ve.dm.MWTransclusionPartModel, ve.EventEmitter );

/* Methods */

/**
 * Get transclusion part is in.
 *
 * @method
 * @returns {ve.dm.MWTransclusionModel} Transclusion
 */
ve.dm.MWTransclusionPartModel.prototype.getTransclusion = function () {
	return this.transclusion;
};

/**
 * Get part origin.
 *
 * @returns {string} Origin
 */
ve.dm.MWTransclusionPartModel.prototype.getOrigin = function () {
	return this.origin;
};

/**
 * Get a unique part ID within the transclusion.
 *
 * @returns {string} Unique ID
 */
ve.dm.MWTransclusionPartModel.prototype.getId = function () {
	return this.id;
};

/**
 * Remove part from transclusion.
 *
 * @method
 */
ve.dm.MWTransclusionPartModel.prototype.remove = function () {
	this.transclusion.removePart( this );
};
