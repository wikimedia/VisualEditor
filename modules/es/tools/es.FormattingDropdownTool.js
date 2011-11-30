es.FormattingDropdownTool = function( toolbar ) {
	es.DropdownTool.call( this, toolbar, 'formatting' );
	$select = $( '<select>' );
	this.$.append($select);
	$select.append( '<option>' );
	$select.append( '<option>Heading 1</option>' );
	$select.append( '<option>Paragraph</option>' );
	$select.append( '<option>Preformatted</option>' );
	 
};

es.FormattingDropdownTool.prototype.updateState = function( selection, annotations ) {
};

es.ToolbarView.tools.formatting = es.FormattingDropdownTool;

es.extendClass( es.BoldButtonTool, es.DropdownTool );
