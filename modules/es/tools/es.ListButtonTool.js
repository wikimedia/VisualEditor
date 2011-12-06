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
	var	stacks = [],
		stack = [],
		i,
		j,
		data;

	//
	// Step 1
	//

	for( i = 0; i < this.nodes.length; i++ ) {
		if ( this.nodes[i].getParent().getElementType() === 'listItem' ) {
			if( stack.length > 0 ) {
				stacks.push ( stack );
				stack = [];
			}
		} else {
			if( stack.length > 0 ) {
				if ( this.nodes[i].getParent() === stack[stack.length - 1].getParent() ) {
					stack.push( this.nodes[i] );
				} else {
					stacks.push ( stack );
					stack = [this.nodes[i]];
				}
			} else {
				stack.push( this.nodes[i] );
			}
		}
	}
	if( stack.length > 0 ) {
		stacks.push ( stack );
	}

	//
	// Step 2
	//
	
	var	insertAt,
		removeLength,
		tx;

	for( i = 0; i < stacks.length; i++ ) {
		removeLength = 0;
		insertAt = this.toolbar.surfaceView.documentView.model.getOffsetFromNode(
			stacks[i][0], false
		);
		data = [ { 'type': 'list' } ];
		for( j = 0; j < stacks[i].length; j++ ) {
			removeLength += stacks[i][j].getElementLength();
			data = data
				.concat( [ { 'type': 'listItem', 'attributes' : { 'styles': [ this.name ] } } ] )
				.concat( stacks[i][j].getElementData() )
				.concat( [ { 'type': '/listItem' } ] );
		}
		data = data.concat( [ { 'type': '/list' } ] );

		tx = this.toolbar.surfaceView.model.getDocument().prepareRemoval(
			new es.Range( insertAt, insertAt+removeLength)
		);
		this.toolbar.surfaceView.model.transact( tx );

		tx = this.toolbar.surfaceView.model.getDocument().prepareInsertion(
			insertAt,
			data
		);
		this.toolbar.surfaceView.model.transact( tx );
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
