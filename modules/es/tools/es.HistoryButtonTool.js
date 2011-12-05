/**
 * Creates an es.HistoryButtonTool object.
 * 
 * @class
 * @constructor
 * @extends {es.ButtonTool}
 * @param {es.ToolbarView} toolbar
 * @param {String} name
 */
es.HistoryButtonTool = function( toolbar, name, data ) {
	// Inheritance
	es.ButtonTool.call( this, toolbar, name );

	// Properties
	this.data = data;
};

/* Methods */

es.HistoryButtonTool.prototype.onClick = function() {
	switch ( this.name ) {
		case 'undo':
			this.toolbar.surfaceView.model.undo( 1 );
			break;
		case 'redo':
			this.toolbar.surfaceView.model.redo( 1 );
			break;
	}
};

es.HistoryButtonTool.prototype.updateState = function( annotations ) {
	//
};

/* Registration */

es.Tool.tools.undo = {
	constructor: es.HistoryButtonTool,
	name: 'undo'
};

es.Tool.tools.redo = {
	constructor: es.HistoryButtonTool,
	name: 'redo'
};

/* Inhertiance */

es.extendClass( es.HistoryButtonTool, es.ButtonTool );
