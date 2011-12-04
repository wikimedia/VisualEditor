es.HistoryButtonTool = function( toolbar, name, data ) {
	es.ButtonTool.call( this, toolbar, name );
	this.data = data;
};

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
};

es.Tool.tools.undo = {
	constructor: es.HistoryButtonTool,
	name: 'undo'
};

es.Tool.tools.redo = {
	constructor: es.HistoryButtonTool,
	name: 'redo'
};


es.extendClass( es.HistoryButtonTool, es.ButtonTool );