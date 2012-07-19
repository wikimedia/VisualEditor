/**
 * VisualEditor user interface HistoryButtonTool class.
 * 
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.HistoryButtonTool object.
 *
 * @class
 * @constructor
 * @extends {ve.ui.ButtonTool}
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 */
ve.ui.HistoryButtonTool = function( toolbar, name, title, data ) {
	// Inheritance
	ve.ui.ButtonTool.call( this, toolbar, name, title );

	// Properties
	this.data = data;
	this.enabled = false;
	
	this.toolbar.getSurfaceView().model.on( 'history', ve.proxy( this.updateState, this ) );
};

/* Methods */

ve.ui.HistoryButtonTool.prototype.onClick = function() {
	switch ( this.name ) {
		case 'undo':
		case 'redo':
			if ( this.isButtonEnabled( this.name ) ) {
				var surfaceView = this.toolbar.getSurfaceView();
				surfaceView.stopPolling();
				surfaceView.showSelection(
					surfaceView.getModel()[this.name]( 1 ) || surfaceView.model.selection
				);
				surfaceView.clearPollData();
				surfaceView.startPolling();
			}
			break;
	}
};

ve.ui.HistoryButtonTool.prototype.updateState = function( annotations ) {
	this.enabled = this.isButtonEnabled( this.name );
	this.updateEnabled();
};

ve.ui.HistoryButtonTool.prototype.isButtonEnabled = function( name ) {
	var surfaceModel = this.toolbar.getSurfaceView().getModel();
	switch( name ) {
		case 'undo':
			return surfaceModel.bigStack.length - surfaceModel.undoIndex > 0;
		case 'redo':
			return surfaceModel.undoIndex > 0;
		default:
			return false;
	}
};

/* Registration */

ve.ui.Tool.tools.undo = {
	'constructor': ve.ui.HistoryButtonTool,
	'name': 'undo',
	'title': ve.msg( 'visualeditor-historybutton-undo-tooltip' )
};

ve.ui.Tool.tools.redo = {
	'constructor': ve.ui.HistoryButtonTool,
	'name': 'redo',
	'title': ve.msg( 'visualeditor-historybutton-redo-tooltip' )
};

/* Inhertiance */

ve.extendClass( ve.ui.HistoryButtonTool, ve.ui.ButtonTool );
