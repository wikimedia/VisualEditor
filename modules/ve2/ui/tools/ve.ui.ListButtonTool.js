/**
 * Creates an ve.ui.ListButtonTool object.
 *
 * @class
 * @constructor
 * @extends {ve.ui.ButtonTool}
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 */
 ve.ui.ListButtonTool = function( toolbar, name, title, data ) {
	// Inheritance
	ve.ui.ButtonTool.call( this, toolbar, name, title );

	// Properties
	this.data = data;
	this.nodes = [];
};

/* Methods */

ve.ui.ListButtonTool.prototype.list = function( nodes, style ) {

};

ve.ui.ListButtonTool.prototype.unlist = function( nodes ) {

};

ve.ui.ListButtonTool.prototype.onClick = function() {
	this.toolbar.surfaceView.model.breakpoint();
	if ( !this.$.hasClass( 'es-toolbarButtonTool-down' ) ) {
		this.list( this.nodes, this.name );
	} else {
		this.unlist( this.nodes );
	}
	this.toolbar.surfaceView.model.breakpoint();
};

ve.ui.ListButtonTool.prototype.updateState = function( annotations, nodes ) {
	/*
	 * XXX: Disabled for now because lists work differently now (they are structured, not flat)
	 *
	function areListItemsOfStyle( nodes, style ) {
		var parent, styles;
		for( var i = 0; i < nodes.length; i++ ) {
			parent = nodes[i].getParent();
			if ( parent.getType() !== 'listItem' ) {
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
	if ( areListItemsOfStyle( this.nodes, this.name ) ) {
		this.$.addClass( 'es-toolbarButtonTool-down' );
	} else {
		this.$.removeClass( 'es-toolbarButtonTool-down' );
	}
	*/
};

/* Registration */

ve.ui.Tool.tools.number = {
	'constructor': ve.ui.ListButtonTool,
	'name': 'number',
	'title': 'Numbered list'
};

ve.ui.Tool.tools.bullet = {
	'constructor': ve.ui.ListButtonTool,
	'name': 'bullet',
	'title': 'Bulleted list'
};

/* Inheritance */

ve.extendClass( ve.ui.ListButtonTool, ve.ui.ButtonTool );
