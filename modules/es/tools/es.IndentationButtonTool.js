/**
 * Creates an es.IndentationButtonTool object.
 * 
 * @class
 * @constructor
 * @extends {es.ButtonTool}
 * @param {es.ToolbarView} toolbar
 * @param {String} name
 */
 es.IndentationButtonTool = function( toolbar, name, data ) {
	es.ButtonTool.call( this, toolbar, name );
	this.data = data;
};

/* Methods */

es.IndentationButtonTool.prototype.onClick = function() {
	if ( !this.$.hasClass( 'es-toolbarButtonTool-disabled' ) ) {
		var	listItems = [],
			listItem,
			i;
		for ( i = 0; i < this.nodes.length; i++ ) {
			listItem = this.nodes[i].getParent();
			if ( listItems.length > 0 ) {
				if (listItem != listItems[listItems.length - 1]) {
					listItems.push( listItem );
				}
			} else {
				listItems.push( listItem );
			}
		}
		if ( this.name === 'indent' ) {
			this.indent( listItems );
		} else if ( this.name === 'outdent' ) {
			this.outdent( listItems );
		}
	}
};

es.IndentationButtonTool.prototype.indent = function( listItems ) {
	var	surface = this.toolbar.surfaceView,
		styles,
		i;

	for ( i = 0; i < listItems.length; i++ ) {
		styles = listItems[i].getElementAttribute( 'styles' );
		if ( styles.length < 6 ) {
			styles.push( styles[styles.length - 1] );
			tx = surface.model.getDocument().prepareElementAttributeChange(
				surface.documentView.model.getOffsetFromNode( listItems[i], false ),
				'set',
				'styles',
				styles
			);
			surface.model.transact( tx );
		}
	}
	surface.emitCursor();
};

es.IndentationButtonTool.prototype.outdent = function( listItems ) {
	var	surface = this.toolbar.surfaceView,
		styles,
		i;

	for ( i = 0; i < listItems.length; i++ ) {
		styles = listItems[i].getElementAttribute( 'styles' );
		console.log(styles);
		if ( styles.length > 1 ) {
			styles.splice( styles.length - 1, 1);
			tx = surface.model.getDocument().prepareElementAttributeChange(
				surface.documentView.model.getOffsetFromNode( listItems[i], false ),
				'set',
				'styles',
				styles
			);
			surface.model.transact( tx );
		}
	}
	surface.emitCursor();
};

es.IndentationButtonTool.prototype.updateState = function( annotations, nodes ) {
	function areListItems( nodes ) {
		for( var i = 0; i < nodes.length; i++ ) {
			if ( nodes[i].getParent().getElementType() !== 'listItem' ) {
				return false;
			}
		}
		return true;
	}

	this.nodes = nodes;
	if ( areListItems( this.nodes ) ) {
		this.$.removeClass( 'es-toolbarButtonTool-disabled' );
	} else {
		this.$.addClass( 'es-toolbarButtonTool-disabled' );
	}
};

/* Registration */

es.Tool.tools.indent = {
	constructor: es.IndentationButtonTool,
	name: 'indent'
};

es.Tool.tools.outdent = {
	constructor: es.IndentationButtonTool,
	name: 'outdent'
};

/* Inheritance */

es.extendClass( es.IndentationButtonTool, es.ButtonTool );