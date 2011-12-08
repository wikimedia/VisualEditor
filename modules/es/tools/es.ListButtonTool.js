/**
 * Creates an es.ListButtonTool object.
 * 
 * @class
 * @constructor
 * @extends {es.ButtonTool}
 * @param {es.ToolbarView} toolbar
 * @param {String} name
 */
 es.ListButtonTool = function( toolbar, name, data ) {
	// Inheritance
	es.ButtonTool.call( this, toolbar, name );

	// Properties
	this.data = data;
	this.nodes = [];
};

/* Methods */

es.ListButtonTool.prototype.list = function( nodes, style ) {
	var	surface = this.toolbar.surfaceView,
		selection = surface.currentSelection.clone(),
		stack = [],
		stacks = [],
		listItems = [],
		parent,
		styles,
		insertAt,
		removeLength,
		data,
		txs = [],
		i,
		j;

	for( i = 0; i < nodes.length; i++ ) {
		parent = nodes[i].getParent();
		if ( parent.getElementType() === 'listItem' ) {
			if ( stack.length > 0 ) {
				stacks.push( stack );
				stack = [];
			}
			listItems.push( parent );
		} else {
			if( stack.length > 0 ) {
				if ( parent === stack[stack.length - 1].getParent() ) {
					stack.push( nodes[i] );
				} else {
					stacks.push( stack );
					stack = [ nodes[i] ];
				}
			} else {
				stack.push( nodes[i] );
			}
		}
	}
	if( stack.length > 0 ) {
		stacks.push( stack );
	}
	
	if ( selection.from === selection.to ) {
		selection.from += 2;
		selection.to += 2;
	} else {
		if ( stacks.length > 0 ) {
			if ( nodes[0].getParent().getElementType() != 'listItem' ) {
				if ( selection.from < selection.to ) {
					selection.from += 2;
				} else {
					selection.to += 2;
				}
			}
			if ( selection.from < selection.to ) {
				selection.to += (stacks.length * 2) + (nodes.length - listItems.length - 1) * 2;
			} else {
				selection.from += (stacks.length * 2) + (nodes.length - listItems.length - 1) * 2;
			}
		}
	}

	for( i = 0; i < listItems.length; i++ ) {
		styles = listItems[i].getElementAttribute( 'styles' );
		if ( styles[styles.length - 1] !== style ) {
			styles.splice( styles.length - 1, 1, style );
			txs.push( surface.model.getDocument().prepareElementAttributeChange(
				surface.documentView.model.getOffsetFromNode( listItems[i], false ),
				'set',
				'styles',
				styles
			) );
		}
	}

	for( i = 0; i < stacks.length; i++ ) {
		removeLength = 0;
		insertAt = surface.documentView.model.getOffsetFromNode( stacks[i][0], false );

		data = [ { 'type': 'list' } ];
		for( j = 0; j < stacks[i].length; j++ ) {
			removeLength += stacks[i][j].getElementLength();

			data = data
				.concat( [ {
					'type': 'listItem',
					'attributes' : { 'styles': [ this.name ] }
				} ] )
				//.concat( stacks[i][j].getElementData() )
				.concat( [ { 'type': 'paragraph' } ] )
				.concat( stacks[i][j].getContentData() )
				.concat( [ { 'type': '/paragraph' } ] )
				.concat( [ { 'type': '/listItem' } ] );
		}
		data = data.concat( [ { 'type': '/list' } ] );

		txs.push( surface.model.getDocument().prepareInsertion( insertAt, data ) );
		txs.push( surface.model.getDocument().prepareRemoval(
			new es.Range( insertAt + data.length, insertAt + removeLength + data.length )
		) );
	}
	surface.model.transact( txs );
	surface.model.select( selection, true );
};

es.ListButtonTool.prototype.unlist = function() {
	alert( 'This functionality is not yet supported.' );
	/*
		// unlist
		//
		// Step 1
		//
		
		var	listItems = [],
			listItem,
			i,
			j;
		
		for( i = 0; i < this.nodes.length; i++ ) {
			listItem = this.nodes[i].getParent();
			if ( listItems.length > 0 ) {
				if (listItem != listItems[listItems.length - 1]) {
					listItems.push( listItem );
				}
			} else {
				listItems.push( listItem );
			}
		}
		
		var stacks = [];
		var stack = { first: false, last: false, nodes: [], offset: -1, length: 0 };
		for( i = 0; i < listItems.length; i++ ) {
			if( stack.nodes.length > 0 ) {
				if ( stack.nodes[stack.nodes.length - 1].getParent() != listItems[i].getParent() ) {
					stacks.push(stack);
					stack = { first: false, last: false, nodes: [], offset: -1, length: 0 };
				}
			}
			
			if ( listItems[i].getParent().indexOf( listItems[i] ) === 0 ) {
				stack.first = true;
			}
			if ( listItems[i].getParent().indexOf( listItems[i] ) === listItems[i].getParent().children.length - 1 ) {
				stack.last = true;
			}
			if( stack.nodes.length === 0 ){
				stack.offset = this.toolbar.surfaceView.documentView.model.getOffsetFromNode(listItems[i], false);
			}
			stack.length += listItems[i].getElementLength();
			stack.nodes.push( listItems[i] );
			
		}
		if( stack.nodes.length > 0 ) {
			stacks.push(stack);
		}

		//
		// Step 2
		//
		var data;
		
		for( i = 0; i < stacks.length; i++ ) {
			stack = stacks[i];
			if( stack.first === false && stack.last === false ) {


				tx = this.toolbar.surfaceView.model.getDocument().prepareRemoval(
					new es.Range( stack.offset, stack.offset+stack.length )
				);
				this.toolbar.surfaceView.model.transact( tx );

				data = [ { 'type': '/list' }, { 'type': 'list' } ];
				tx = this.toolbar.surfaceView.model.getDocument().prepareInsertion(
					stack.offset,
					data
				);
				console.log(tx);
				this.toolbar.surfaceView.model.transact( tx );

			}
		}
*/
};

es.ListButtonTool.prototype.onClick = function() {
	if ( !this.$.hasClass( 'es-toolbarButtonTool-down' ) ) {
		this.list( this.nodes, this.name );
	} else {
		this.unlist( this.nodes );
	}
};

es.ListButtonTool.prototype.updateState = function( annotations, nodes ) {
	function areListItemsOfStyle( nodes, style ) {
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
	if ( areListItemsOfStyle( this.nodes, this.name ) ) {
		this.$.addClass( 'es-toolbarButtonTool-down' );
	} else {
		this.$.removeClass( 'es-toolbarButtonTool-down' );
	}
};

/* Registration */

es.Tool.tools.number = {
	constructor: es.ListButtonTool,
	name: 'number'
};

es.Tool.tools.bullet = {
	constructor: es.ListButtonTool,
	name: 'bullet'
};

/* Inheritance */

es.extendClass( es.ListButtonTool, es.ButtonTool );
