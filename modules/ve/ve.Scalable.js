/*!
 * VisualEditor Scalable class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Scalable object.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [fixedRatio=true] Object has a fixed aspect ratio
 * @cfg {Object} [currentDimensions] Current dimensions, width & height
 * @cfg {Object} [originalDimensions] Original dimensions, width & height
 * @cfg {Object} [minDimensions] Minimum dimensions, width & height
 * @cfg {Object} [maxDimensions] Maximum dimensions, width & height
 * @cfg {boolean} [enforceMin=true] Enforce the minimum dimensions
 * @cfg {boolean} [enforceMax=true] Enforce the maximum dimensions
 */
ve.Scalable = function VeScalable( config ) {
	config = ve.extendObject( {
		'fixedRatio': true
	}, config );

	// Properties
	this.fixedRatio = config.fixedRatio;
	this.currentDimensions = config.currentDimensions || null;
	this.originalDimensions = config.originalDimensions || null;
	this.minDimensions = config.minDimensions || null;
	this.maxDimensions = config.maxDimensions || null;
	this.enforceMin = config.enforceMin !== false;
	this.enforceMax = config.enforceMax !== false;

	// Computed properties
	this.ratio = null;
	this.valid = null;

	this.init();
};

/**
 * Call setters with current values so computed values are updated
 */
ve.Scalable.prototype.init = function () {
	if ( this.currentDimensions ) {
		this.setCurrentDimensions( this.currentDimensions );
	}
	if ( this.originalDimensions ) {
		this.setOriginalDimensions( this.originalDimensions );
	}
	if ( this.minDimensions ) {
		this.setMinDimensions( this.minDimensions );
	}
	if ( this.maxDimensions ) {
		this.setMaxDimensions( this.maxDimensions );
	}
};

/**
 * Set properties from another scalable object
 *
 * @param {ve.Scalable} scalable Scalable object
 */
ve.Scalable.prototype.setPropertiesFromScalable = function ( scalable ) {
	// Properties
	this.fixedRatio = scalable.fixedRatio;
	this.currentDimensions = scalable.currentDimensions;
	this.originalDimensions = scalable.originalDimensions;
	this.minDimensions = scalable.minDimensions;
	this.maxDimensions = scalable.maxDimensions;
	this.enforceMin = scalable.enforceMin;
	this.enforceMax = scalable.enforceMax;

	// Computed properties
	this.ratio = null;
	this.valid = null;

	this.init();
};

/**
 * Set the fixed aspect ratio from specified dimensions.
 *
 * @param {Object} dimensions Dimensions object with width & height
 */
ve.Scalable.prototype.setRatioFromDimensions = function ( dimensions ) {
	if ( dimensions.width && dimensions.height ) {
		this.ratio = dimensions.width / dimensions.height;
	}
};

/**
 * Set the original dimensions of an image
 *
 * @param {Object} dimensions Dimensions object with width & height
 */
ve.Scalable.prototype.setCurrentDimensions = function ( dimensions ) {
	this.currentDimensions = ve.copy( dimensions );
	// Only use current dimensions for ratio if it isn't set
	if ( this.fixedRatio && !this.ratio ) {
		this.setRatioFromDimensions( this.getCurrentDimensions() );
	}
	this.valid = null;
};

/**
 * Set the original dimensions of an image
 *
 * @param {Object} dimensions Dimensions object with width & height
 */
ve.Scalable.prototype.setOriginalDimensions = function ( dimensions ) {
	this.originalDimensions = ve.copy( dimensions );
	// Always overwrite ratio
	if ( this.fixedRatio ) {
		this.setRatioFromDimensions( this.getOriginalDimensions() );
	}
};

/**
 * Set the minimum dimensions of an image
 *
 * @param {Object} dimensions Dimensions object with width & height
 */
ve.Scalable.prototype.setMinDimensions = function ( dimensions ) {
	this.minDimensions = ve.copy( dimensions );
	this.valid = null;
};

/**
 * Set the maximum dimensions of an image
 *
 * @param {Object} dimensions Dimensions object with width & height
 */
ve.Scalable.prototype.setMaxDimensions = function ( dimensions ) {
	this.maxDimensions = ve.copy( dimensions );
	this.valid = null;
};

/**
 * Get the original dimensions of an image
 *
 * @returns {Object} Dimensions object with width & height
 */
ve.Scalable.prototype.getCurrentDimensions = function () {
	return this.currentDimensions;
};

/**
 * Get the original dimensions of an image
 *
 * @returns {Object} Dimensions object with width & height
 */
ve.Scalable.prototype.getOriginalDimensions = function () {
	return this.originalDimensions;
};

/**
 * Get the minimum dimensions of an image
 *
 * @returns {Object} Dimensions object with width & height
 */
ve.Scalable.prototype.getMinDimensions = function () {
	return this.minDimensions;
};

/**
 * Get the maximum dimensions of an image
 *
 * @returns {Object} Dimensions object with width & height
 */
ve.Scalable.prototype.getMaxDimensions = function () {
	return this.maxDimensions;
};

/**
 * The object enforces the minimum dimensions when scaling
 *
 * @returns {boolean} Enforces the minimum dimensions
 */
ve.Scalable.prototype.isEnforcedMin = function () {
	return this.enforceMin;
};

/**
 * The object enforces the maximum dimensions when scaling
 *
 * @returns {boolean} Enforces the maximum dimensions
 */
ve.Scalable.prototype.isEnforcedMax = function () {
	return this.enforceMax;
};

/**
 * Set enforcement of minimum dimensions
 *
 * @param {boolean} enforceMin Enforces the minimum dimensions
 */
ve.Scalable.prototype.setEnforcedMin = function ( enforceMin ) {
	this.valid = null;
	this.enforceMin = enforceMin;
};

/**
 * Set enforcement of maximum dimensions
 *
 * @param {boolean} enforceMax Enforces the maximum dimensions
 */
ve.Scalable.prototype.setEnforcedMax = function ( enforceMax ) {
	this.valid = null;
	this.enforceMax = enforceMax;
};

/**
 * Get the fixed aspect ratio (width/height)
 *
 * @returns {number} Aspect ratio
 */
ve.Scalable.prototype.getRatio = function () {
	return this.ratio;
};

/**
 * Check if the object has a fixed ratio
 *
 * @returns {boolean} The object has a fixed ratio
 */
ve.Scalable.prototype.isFixedRatio = function () {
	return this.fixedRatio;
};

/**
 * Get the current scale of the object
 *
 * @returns {number|null} A scale (1=100%), or null if not applicable
 */
ve.Scalable.prototype.getCurrentScale = function () {
	if ( !this.isFixedRatio() || !this.getCurrentDimensions() || !this.getOriginalDimensions() ) {
		return null;
	}
	return this.getCurrentDimensions().width / this.getOriginalDimensions().width;
};

/**
 * Check if current dimensions are smaller than minimum dimensions in either direction
 *
 * Only possible if enforceMin is false.
 *
 * @returns {boolean} Current dimensions are greater than maximum dimensions
 */
ve.Scalable.prototype.isTooSmall = function () {
	return !!( this.getCurrentDimensions() && this.getMinDimensions() && (
			this.getCurrentDimensions().width < this.getMinDimensions().width ||
			this.getCurrentDimensions().height < this.getMinDimensions().height
		) );
};

/**
 * Check if current dimensions are greater than maximum dimensions in either direction
 *
 * Only possible if enforceMax is false.
 *
 * @returns {boolean} Current dimensions are greater than maximum dimensions
 */
ve.Scalable.prototype.isTooLarge = function () {
	return !!( this.getCurrentDimensions() && this.getMaxDimensions() && (
			this.getCurrentDimensions().width > this.getMaxDimensions().width ||
			this.getCurrentDimensions().height > this.getMaxDimensions().height
		) );
};

/**
 * Get a set of dimensions bounded by current restrictions, from specified dimensions
 *
 * @param {Object} dimensions Dimensions object with width & height
 * @param {number} [grid] Optional grid size to snap to
 * @returns {Object} Dimensions object with width & height
 */
ve.Scalable.prototype.getBoundedDimensions = function ( dimensions, grid ) {
	var ratio, snap, snapMin, snapMax,
		minDimensions = this.isEnforcedMin() && this.getMinDimensions(),
		maxDimensions = this.isEnforcedMax() && this.getMaxDimensions();

	// Don't modify the input
	dimensions = ve.copy( dimensions );

	// Bound to min/max
	if ( minDimensions ) {
		dimensions.width = Math.max( dimensions.width, this.minDimensions.width );
		dimensions.height = Math.max( dimensions.height, this.minDimensions.height );
	}
	if ( maxDimensions ) {
		dimensions.width = Math.min( dimensions.width, this.maxDimensions.width );
		dimensions.height = Math.min( dimensions.height, this.maxDimensions.height );
	}

	// Bound to ratio
	if ( this.isFixedRatio() ) {
		ratio = dimensions.width / dimensions.height;
		if ( ratio < this.getRatio() ) {
			dimensions.height = Math.round( dimensions.width / this.getRatio() );
		} else {
			dimensions.width = Math.round( dimensions.height * this.getRatio() );
		}
	}

	// Snap to grid
	if ( grid ) {
		snapMin = minDimensions ? Math.ceil( minDimensions.width / grid ) : -Infinity;
		snapMax = maxDimensions ? Math.floor( maxDimensions.width / grid ) : Infinity;
		snap = Math.round( dimensions.width / grid );
		dimensions.width = Math.max( Math.min( snap, snapMax ), snapMin ) * grid;
		if ( this.isFixedRatio() ) {
			// If the ratio is fixed we can't snap both to the grid, so just snap the width
			dimensions.height = dimensions.width / this.getRatio();
		} else {
			snapMin = minDimensions ? Math.ceil( minDimensions.height / grid ) : -Infinity;
			snapMax = maxDimensions ? Math.floor( maxDimensions.height / grid ) : Infinity;
			snap = Math.round( dimensions.height / grid );
			dimensions.height = Math.max( Math.min( snap, snapMax ), snapMin ) * grid;
		}
	}

	return dimensions;
};

/**
 * Checks whether the current dimensions are numeric and within range
 *
 * @returns {boolean} Current dimensions are valid
 */
ve.Scalable.prototype.isCurrentDimensionsValid = function () {
	if ( this.valid === null ) {
		var dimensions = this.getCurrentDimensions(),
			minDimensions = this.isEnforcedMin() && this.getMinDimensions(),
			maxDimensions = this.isEnforcedMax() && this.getMaxDimensions();

		this.valid = (
			$.isNumeric( dimensions.width ) &&
			$.isNumeric( dimensions.height ) &&
			(
				!minDimensions || (
					dimensions.width >= minDimensions.width &&
					dimensions.height >= minDimensions.height
				)
			) &&
			(
				!maxDimensions || (
					dimensions.width <= maxDimensions.width &&
					dimensions.height <= maxDimensions.height
				)
			)
		);
	}
	return this.valid;
};
