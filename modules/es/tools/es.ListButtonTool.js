es.ListButtonTool = function( toolbar, name, data ) {
	es.ButtonTool.call( this, toolbar, name );
	this.data = data;
	this.nodes = [];
};

es.ListButtonTool.prototype.onClick = function() {
	/*
	var parent;
	for( var i = 0; i < this.nodes.length; i++ ) {
		parent = this.nodes[i].getParent();
		if ( parent.getElementType() !== 'listItem' ) {
			console.log( this.nodes[i] );
		}
	}
	*/
};

es.ListButtonTool.prototype.updateState = function( annotations, nodes ) {
	// checks if all passed nodes are listItems of passed style
	function check( nodes, style ) {
		var parent, styles;
		for( var i = 0; i < nodes.length; i++ ) {
			parent = nodes[i].getParent();
			if ( parent.getElementType() !== 'listItem' ) {
				return false;
			}
			styles = parent.getElementAttribute( 'styles' );
			if ( styles[ styles.length - 1] !== style ) {
				return false;
			}
		}
		return true;
	}
	
	this.nodes = nodes;
	if ( check( this.nodes, this.name ) ) {
		this.$.addClass( 'es-toolbarButtonTool-down' );
	} else {
		this.$.removeClass( 'es-toolbarButtonTool-down' );	
	}
};

es.Tool.tools.number = {
	constructor: es.ListButtonTool,
	name: 'number'
};

es.Tool.tools.bullet = {
	constructor: es.ListButtonTool,
	name: 'bullet'
};

es.extendClass( es.ListButtonTool, es.ButtonTool );