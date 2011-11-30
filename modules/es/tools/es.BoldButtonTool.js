es.BoldButtonTool = function() {
	es.ButtonTool.call( this, toolbar, 'bold' );
};

es.ToolbarView.tools.bold = es.BoldButtonTool;

es.extendClass( es.BoldButtonTool, es.ButtonTool );