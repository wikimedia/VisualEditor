/**
 * Creates an ve.ui.IndentationButtonTool object.
 *
 * @class
 * @constructor
 * @extends {ve.ui.ButtonTool}
 * @param {ve.ui.Toolbar} toolbar
 * @param {String} name
 */
 ve.ui.IndentationButtonTool = function( toolbar, name, title, data ) {
	ve.ui.ButtonTool.call( this, toolbar, name, title );
	this.data = data;
};

/* Methods */

ve.ui.IndentationButtonTool.prototype.onClick = function() {
	if ( !this.$.hasClass( 'es-toolbarButtonTool-disabled' ) ) {
		var	listItems = [],
			listItem,
			i;
		// FIXME old code, doesn't work
		for ( i = 0; i < this.nodes.length; i++ ) {
			listItem = this.nodes[i].getParent();
			if ( listItems.length > 0 ) {
				if (listItem !== listItems[listItems.length - 1]) {
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

ve.ui.IndentationButtonTool.prototype.indent = function( listItems ) {
	// FIXME old code, doesn't work
	var	surface = this.toolbar.surfaceView,
		styles,
		i,
		tx;

	for ( i = 0; i < listItems.length; i++ ) {
		styles = listItems[i].getElementAttribute( 'styles' );
		if ( styles.length < 6 ) {
			tx = surface.model.getDocument().prepareElementAttributeChange(
				surface.documentView.model.getOffsetFromNode( listItems[i], false ),
				'styles',
				styles.concat( styles[styles.length - 1] )
			);
			surface.model.change( tx );
		}
	}
	surface.emitCursor();
};

ve.ui.IndentationButtonTool.prototype.outdent = function( listItems ) {
	// FIXME old code, doesn't work
	var	surface = this.toolbar.surfaceView,
		styles,
		i,
		tx;

	for ( i = 0; i < listItems.length; i++ ) {
		styles = listItems[i].getElementAttribute( 'styles' );
		if ( styles.length > 1 ) {
			tx = surface.model.getDocument().prepareElementAttributeChange(
				surface.documentView.model.getOffsetFromNode( listItems[i], false ),
				'styles',
				styles.slice( 0, styles.length - 1 )
			);
			surface.model.change( tx );
		}
	}
	surface.emitCursor();
};

ve.ui.IndentationButtonTool.prototype.updateState = function( annotations, nodes ) {
	// FIXME old code, doesn't work
	function areListItems( nodes ) {
		for( var i = 0; i < nodes.length; i++ ) {
			if (
				nodes[i].parent !== null &&
				nodes[i].getParent().getType() !== 'listItem' )
			{
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

// Commented out because these don't work yet
/*
ve.ui.Tool.tools.indent = {
	'constructor': ve.ui.IndentationButtonTool,
	'name': 'indent',
	'title': ve.msg( 'visualeditor-indentationbutton-indent-tooltip' ),
};

ve.ui.Tool.tools.outdent = {
	'constructor': ve.ui.IndentationButtonTool,
	'name': 'outdent',
	'title': ve.msg( 'visualeditor-indentationbutton-outdent-tooltip' ),
};
*/

/* Inheritance */

ve.extendClass( ve.ui.IndentationButtonTool, ve.ui.ButtonTool );
