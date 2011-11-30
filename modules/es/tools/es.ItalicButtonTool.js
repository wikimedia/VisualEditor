es.ItalicButtonTool = function( toolbar ) {
	es.ButtonTool.call( this, toolbar, 'italic' );
};

es.ToolbarView.tools.italic = es.ItalicButtonTool;

es.extendClass( es.ItalicButtonTool, es.ButtonTool );