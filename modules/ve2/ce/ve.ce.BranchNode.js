/**
 * ContentEditable node that can have branch or leaf children.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.BranchNode}
 * @extends {ve.ce.Node}
 * @param {String} type Symbolic name of node type
 * @param model {ve.dm.BranchNode} Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
ve.ce.BranchNode = function( type, model, $element ) {
	// Inheritance
	ve.BranchNode.call( this );
	ve.ce.Node.call( this, type, model, $element );

	// Properties
	this.domWrapperElementType = this.$.get(0).nodeName.toLowerCase();

	// Events
	this.model.addListenerMethod( this, 'splice', 'onSplice' );

	// DOM Changes
	this.$.addClass( 've-ce-branchNode' );

	// Initialization
	if ( model.getChildren().length ) {
		this.onSplice.apply( this, [0, 0].concat( model.getChildren() ) );
	}
};

/* Static Methods */

ve.ce.BranchNode.getDomWrapperType = function( model, key ) {
	var value = model.getAttribute( key );
	if ( value === undefined ) {
		throw 'Undefined attribute: ' + key;
	}
	var types = ve.ce.factory.lookup( model.getType() ).domWrapperElementTypes;
	if ( types[value] === undefined ) {
		throw 'Invalid attribute value: ' + value;
	}
	return types[value];
};

ve.ce.BranchNode.getDomWrapper = function( model, key ) {
	var type = ve.ce.BranchNode.getDomWrapperType( model, key );
	return $( '<' + type + '></' + type + '>' );
};

/* Methods */

ve.ce.BranchNode.prototype.updateDomWrapper = function( key ) {
	var type = ve.ce.BranchNode.getDomWrapperType( this.model, key );
	if ( type !== this.domWrapperElementType ) {
		var $element = $( '<' + type + '></' + type + '>' );
		// Copy classes
		$element.attr( 'class', this.$.attr( 'class' ) );
		// Move contents
		$element.append( this.$.contents() );
		// Swap elements
		this.$.replaceWith( $element );
		// Use new element from now on
		this.$ = $element;
	}
};

/**
 * Responds to splice events on a ve.dm.BranchNode.
 * 
 * ve.ce.Node objects are generated from the inserted ve.dm.Node objects, producing a view that's a
 * mirror of it's model.
 * 
 * @method
 * @param {Integer} index Index to remove and or insert nodes at
 * @param {Integer} howmany Number of nodes to remove
 * @param {ve.dm.BranchNode} [...] Variadic list of nodes to insert
 */
ve.ce.BranchNode.prototype.onSplice = function( index, howmany ) {
	var i,
		length,
		args = Array.prototype.slice.call( arguments, 0 );
	// Convert models to views and attach them to this node
	if ( args.length >= 3 ) {
		for ( i = 2, length = args.length; i < length; i++ ) {
			args[i] = ve.ce.factory.create( args[i].getType(), args[i] );
		}
	}
	var removals = this.children.splice.apply( this.children, args );
	for ( i = 0, length = removals.length; i < length; i++ ) {
		removals[i].detach();
		// Update DOM
		removals[i].$.detach();
	}
	if ( args.length >= 3 ) {
		var $target;
		if ( index ) {
			// Get the element before the insertion point
			$anchor = this.$.children().eq( index - 1 );
		}
		for ( i = args.length - 1; i >= 2; i-- ) {
			args[i].attach( this );
			if ( index ) {
				$anchor.after( args[i].$ );
			} else {
				this.$.prepend( args[i].$ );
			}
		}
	}
};

/* Inheritance */

ve.extendClass( ve.ce.BranchNode, ve.BranchNode );
ve.extendClass( ve.ce.BranchNode, ve.ce.Node );
