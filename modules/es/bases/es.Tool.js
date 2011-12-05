/**
 * Creates an es.Tool object.
 * 
 * @class
 * @constructor
 * @param {es.ToolbarView} toolbar
 * @param {String} name
 */
es.Tool = function( toolbar, name ) {
	this.toolbar = toolbar;
	this.name = name;
	this.$ = $( '<div class="es-tool"></div>' ).attr( 'title', this.name );
};

/* Static Members */

es.Tool.tools = {};

/* Methods */

es.Tool.prototype.updateState = function() {
	throw 'Tool.updateState not implemented in this subclass:' + this.constructor;
};
