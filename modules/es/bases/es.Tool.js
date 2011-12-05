es.Tool = function( toolbar, name ) {
	this.toolbar = toolbar;
	this.name = name;
	this.$ = $( '<div>' ).attr( 'title', this.name );
};

es.Tool.prototype.updateState = function() {
	throw 'Tool.updateState not implemented in this subclass:' + this.constructor;
};

es.Tool.tools = {};
