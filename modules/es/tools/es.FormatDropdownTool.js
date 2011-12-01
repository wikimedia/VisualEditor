es.FormatDropdownTool = function( toolbar, name ) {
	es.DropdownTool.call( this, toolbar, name );

	this.formats = [
		{ 'name': 'Paragraph', 'type' : 'paragraph' },
		{ 'name': 'Heading Level 1', 'type' : 'heading', 'attributes': { 'level': 1 } },
		{ 'name': 'Heading Level 2', 'type' : 'heading', 'attributes': { 'level': 2 } },
		{ 'name': 'Heading Level 3', 'type' : 'heading', 'attributes': { 'level': 3 } },
		{ 'name': 'Heading Level 4', 'type' : 'heading', 'attributes': { 'level': 4 } },
		{ 'name': 'Heading Level 5', 'type' : 'heading', 'attributes': { 'level': 5 } },
		{ 'name': 'Heading Level 6', 'type' : 'heading', 'attributes': { 'level': 6 } },
		{ 'name': 'Preformatted', 'type' : 'pre' }
	];
	
	this.$select.append( '<option>' );

	for ( var i = 0; i < this.formats.length; i++ ) {
		$( '<option>' ).val( i ).html( this.formats[i].name ).appendTo( this.$select );
	}
};

es.FormatDropdownTool.prototype.onChange = function() {
	var index = this.$select.val();
	if ( index in this.formats ) {
		var txs = this.toolbar.surfaceView.model.getDocument().prepareLeafConversion(
			this.toolbar.surfaceView.currentSelection,
			this.formats[index].type,
			this.formats[index].attributes
		)
		for ( var i = 0; i < txs.length; i++ ) {
			this.toolbar.surfaceView.model.transact( txs[i] );
		}
	}
};

es.FormatDropdownTool.prototype.updateState = function( annotations ) {
	// ...
};

es.Tool.tools.format = {
	constructor: es.FormatDropdownTool,
	name: 'format'
};

es.extendClass( es.FormatDropdownTool, es.DropdownTool );