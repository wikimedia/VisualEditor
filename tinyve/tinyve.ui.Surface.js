/**
 * TinyVE UI Surface - the top-level surface object
 *
 * This is a toy version of ve.ui.Surface which illustrates the main concepts
 */

/**
 * Top-level surface object
 *
 * @class
 *
 * @constructor
 * @param {tinyve.dm.Surface} model The surface model
 * @param {Object} config Configuration for OO.ui.Element
 */
tinyve.ui.Surface = function TinyVeUiSurface( model, config = {} ) {
	tinyve.ui.Surface.super.call( this, config );

	/**
	 * @property {tinyve.dm.Surface} model The surface model
	 */
	this.model = model;

	/**
	 * @property {tinyve.ce.Surface} view The surface view
	 */
	this.view = new tinyve.ce.Surface( model, this );
	this.$element.addClass( 'tinyve-ui-Surface' )
		.append( this.view.$element );
};

OO.inheritClass( tinyve.ui.Surface, OO.ui.Element );
