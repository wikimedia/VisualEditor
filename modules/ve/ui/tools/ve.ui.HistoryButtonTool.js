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
 * @param title
 * @param data
 */
ve.ui.HistoryButtonTool = function VeUiHistoryButtonTool( toolbar, name, title, data ) {
	// Parent constructor
	ve.ui.ButtonTool.call( this, toolbar, name, title );

	// Properties
	this.data = data;
	this.enabled = false;
	
	this.toolbar.getSurfaceView().model.addListenerMethod( this, 'history', 'onUpdateState' );
};

/* Inheritance */

ve.inheritClass( ve.ui.HistoryButtonTool, ve.ui.ButtonTool );

/* Methods */

ve.ui.HistoryButtonTool.prototype.onClick = function () {
	if ( ( this.name === 'undo' || this.name === 'redo' ) && this.isButtonEnabled() ) {
		var surfaceView = this.toolbar.getSurfaceView(),
			surfaceModel = surfaceView.getModel();
		surfaceView.showSelection(
			surfaceModel[this.name]( 1 ) || surfaceModel.getSelection()
		);
	}
};

ve.ui.HistoryButtonTool.prototype.onUpdateState = function () {
	this.enabled = this.isButtonEnabled( this.name );
	this.updateEnabled();
};

ve.ui.HistoryButtonTool.prototype.isButtonEnabled = function () {
	var surfaceModel = this.toolbar.getSurfaceView().getModel();
	if ( this.name === 'undo' ) {
		return surfaceModel.bigStack.length - surfaceModel.undoIndex > 0;
	} else if ( this.name === 'redo' ) {
		return surfaceModel.undoIndex > 0;
	}
	return false;
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
