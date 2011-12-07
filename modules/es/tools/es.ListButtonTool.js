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

es.ListButtonTool.prototype.onClick = function() {
	if ( !this.$.hasClass( 'es-toolbarButtonTool-down' ) ) {

		var	surface = this.toolbar.surfaceView,
			stack = [],
			stacks = [],
			listItems = [],
			parent,
			styles,
			insertAt,
			removeLength,
			data,
			tx,
			i,
			j;

		for( i = 0; i < this.nodes.length; i++ ) {
			parent = this.nodes[i].getParent();
			if ( parent.getElementType() === 'listItem' ) {
				if ( stack.length > 0 ) {
					stacks.push( stack );
					stack = [];
				}
				listItems.push( parent );
			} else {
				if( stack.length > 0 ) {
					if ( parent === stack[stack.length - 1].getParent() ) {
						stack.push( this.nodes[i] );
					} else {
						stacks.push( stack );
						stack = [this.nodes[i]];
					}
				} else {
					stack.push( this.nodes[i] );
				}
			}
		}
		if( stack.length > 0 ) {
			stacks.push( stack );
		}

		for( i = 0; i < listItems.length; i++ ) {
			styles = listItems[i].getElementAttribute( 'styles' );
			if ( styles[styles.length - 1] !== this.name ) {
				styles.splice( styles.length - 1, 1, this.name );
				tx = surface.model.getDocument().prepareElementAttributeChange(
					surface.documentView.model.getOffsetFromNode( listItems[i], false ),
					'set',
					'styles',
					styles
				);
				surface.model.transact( tx );
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
					.concat( stacks[i][j].getElementData() )
					.concat( [ { 'type': '/listItem' } ] );
			}
			data = data.concat( [ { 'type': '/list' } ] );

			tx = surface.model.getDocument().prepareInsertion( insertAt, data );
			surface.model.transact( tx );

			tx = surface.model.getDocument().prepareRemoval(
				new es.Range( insertAt + data.length, insertAt + removeLength + data.length )
			);
			surface.model.transact( tx );
		}

	} else {
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
	}
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
