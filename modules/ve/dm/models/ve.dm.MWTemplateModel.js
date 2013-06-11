/*!
 * VisualEditor DataModel MWTemplateModel class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * MediaWiki template model.
 *
 * @class
 * @extends ve.dm.MWTransclusionPartModel
 *
 * @constructor
 * @param {ve.dm.MWTransclusionModel} transclusion Transclusion
 * @param {Object} target Template target
 * @param {string} target.wt Original wikitext of target
 * @param {string} [target.href] Hypertext reference to target
 */
ve.dm.MWTemplateModel = function VeDmMWTemplateModel( transclusion, target ) {
	// Parent constructor
	ve.dm.MWTransclusionPartModel.call( this, transclusion );

	// Properties
	this.target = target;
	this.title = ( target.href && target.href.replace( /^(\.\.?\/)*/, '' ) ) || null;
	this.sequence = null;
	this.params = {};
	this.spec = new ve.dm.MWTemplateSpecModel( this );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWTemplateModel, ve.dm.MWTransclusionPartModel );

/* Events */

/**
 * @event add
 * @param {ve.dm.MWTemplateParameterModel} param Added param
 */

/**
 * @event remove
 * @param {ve.dm.MWTemplateParameterModel} param Removed param
 */

/* Methods */

/**
 * Get template target.
 *
 * @method
 * @returns {Object} Template target
 */
ve.dm.MWTemplateModel.prototype.getTarget = function () {
	return this.target;
};

/**
 * Get template title.
 *
 * @method
 * @returns {string|null} Template title, if available
 */
ve.dm.MWTemplateModel.prototype.getTitle = function () {
	return this.title;
};

/**
 * Get template specification.
 *
 * @method
 * @returns {ve.dm.MWTemplateSpecModel} Template specification
 */
ve.dm.MWTemplateModel.prototype.getSpec = function () {
	return this.spec;
};

/**
 * Get all params.
 *
 * @method
 * @returns {Object.<string,ve.dm.MWTemplateParameterModel>} Parameters keyed by name
 */
ve.dm.MWTemplateModel.prototype.getParameters = function () {
	return this.params;
};

/**
 * Get a parameter.
 *
 * @method
 * @param {string} name Parameter name
 * @returns {ve.dm.MWTemplateParameterModel} Parameter
 */
ve.dm.MWTemplateModel.prototype.getParameter = function ( name ) {
	return this.params[name];
};

/**
 * Get ordered list of parameter names.
 *
 * Numeric names, whether strings or real numbers, are placed at the begining, followed by
 * alphabetically sorted names.
 *
 * @method
 * @returns {string[]} List of parameter names
 */
ve.dm.MWTemplateModel.prototype.getParameterNames = function () {
	if ( !this.sequence ) {
		this.sequence = ve.getObjectKeys( this.params ).sort( function ( a, b ) {
			var aIsNaN = isNaN( a ),
				bIsNaN = isNaN( b );
			if ( aIsNaN && bIsNaN ) {
				// Two strings
				return a < b ? -1 : a === b ? 0 : 1;
			}
			if ( aIsNaN ) {
				// A is a string
				return 1;
			}
			if ( bIsNaN ) {
				// B is a string
				return -1;
			}
			// Two numbers
			return a - b;
		} );
	}
	return this.sequence;
};

/**
 * Add a parameter to template.
 *
 * @method
 * @param {string} name Parameter name
 * @param {string} value Parameter value
 * @returns {ve.dm.MWTemplateParameterModel} Added param
 * @emits add
 */
ve.dm.MWTemplateModel.prototype.addParameter = function ( name, value ) {
	var param = new ve.dm.MWTemplateParameterModel( this, name, value );
	this.sequence = null;
	this.params[name] = param;
	this.spec.fill();
	this.emit( 'add', param );
	return param;
};

/**
 * Remove parameter from template.
 *
 * @method
 * @param {string} name Parameter name
 * @emits remove
 */
ve.dm.MWTemplateModel.prototype.removeParameter = function ( name ) {
	var param = this.params[name];
	if ( param ) {
		this.sequence = null;
		delete this.params[name];
		this.emit( 'remove', param );
	}
};
