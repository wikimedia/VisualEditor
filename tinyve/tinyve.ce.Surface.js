/**
 * TinyVE CE Surface - ContentEditable representation of the surface
 *
 * This is a toy version of ve.ce.Surface which illustrates the main concepts
 */

/**
 * ContentEditable representation of the surface
 *
 * @class
 *
 * @constructor
 * @param {tinyve.dm.Surface} model The surface model
 * @param {tinyve.ui.Surface} ui The top-level surface object
 */
tinyve.ce.Surface = function TinyVeCeSurface( model, ui ) {
	// Parent constructor
	tinyve.ce.Surface.super.call( this );

	/**
	 * @property {tinyve.dm.Surface} model The surface model
	 */
	this.model = model;

	/**
	 * @property {tinyve.ui.Surface} surface The top-level surface object
	 */
	this.surface = ui;

	/**
	 * @property {tinyve.ce.Document} documentView the CE document view
	 */
	this.documentView = new tinyve.ce.Document( model.documentModel, this );

	/**
	 * @property {number} renderLock If > 0, don't render model changes
	 *
	 * Used to stop changes detected in the contentEditable surface from propagating
	 * back from the model
	 */
	this.renderLock = 0;

	this.$element.addClass( 'tinyve-ce-Surface' );
	this.$element.prop( 'contentEditable', true );
	this.$element.append( this.documentView.documentNode.$element );
};

/* Inheritance */

OO.inheritClass( tinyve.ce.Surface, OO.ui.Element );

/* Methods */

/**
 * Create a view node to represent a model node in the DOM
 *
 * In full VE, this is done with a view factory so extensions can add types
 *
 * @param {tinyve.dm.Node} model The model node
 * @return {tinyve.ce.Node} View node to represent the model node in the DOM
 */
tinyve.ce.Surface.prototype.buildNode = function ( model ) {
	if ( model instanceof tinyve.dm.ContentBranchNode ) {
		return new tinyve.ce.ContentBranchNode( model, this );
	} else if ( model instanceof tinyve.dm.BranchNode ) {
		return new tinyve.ce.BranchNode( model, this );
	} else {
		throw new Error( 'Unsupported node' );
	}
};
