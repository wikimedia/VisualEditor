/**
 * Creates an ve.Surface object.
 * 
 * A surface is a top-level object which contains both a surface model and a surface view.
 * 
 * @class
 * @constructor
 * @param {String} id Unique name of editor instance
 * @param {Array} data Document data
 * @param {Object} options Configuration options
 */
ve.Surface = function( id, data, options ) {
	// Properties
	this.id = id;
	this.options = ve.extendObject( {
		// Default options
	}, this.options );
	
	this.dm = ve.dm.DocumentNode.newFromPlainObject( data )
	this.sm = new ve.dm.Surface( this.dm );
	
	//TODO: Find source of breakage when view element is not #es-editor
	this.view = new ve.ce.Surface( $( '#es-editor' ), this.sm );
	this.context = new ve.ui.Context( this.view );
	
	//TODO: Configure toolbar based on this.options.
	this.toolbar = new ve.ui.Toolbar( $( '#es-toolbar'), this.view, options.toolbars.top );
	// Registration
	ve.instances.push( this );
};

ve.Surface.prototype.getSurfaceModel = function() {
	return this.sm;
};

ve.Surface.prototype.getDocumentModel = function() {
	return this.dm;
};

ve.Surface.prototype.getID = function() {
	return this.id;
}