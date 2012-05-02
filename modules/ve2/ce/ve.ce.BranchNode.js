/**
 * ContentEditable node that can have branch or leaf children.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {ve.BranchNode}
 * @extends {ve.ce.Node}
 * @param model {ve.dm.BranchNode} Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
ve.ce.BranchNode = function( model, $element ) {
	// Inheritance
	ve.BranchNode.call( this );
	ve.ce.Node.call( this, model, $element );

	// Events
	this.model.addListenerMethod( this, 'splice', 'onSplice' );

	// Initialization
	if ( model.getChildren().length ) {
		this.onSplice.apply( this, [0, 0].concat( model.getChildren() ) );
	}
};

/* Methods */

ve.ce.BranchNode.prototype.replaceDomWrapper = function( $element ) {
	// Copy classes
	$element.attr( 'class', this.$.attr( 'class' ) );
	// Move contents
	$element.append( this.$.contents() );
	// Swap elements
	this.$.replaceWith( $element );
	// Use new element from now on
	this.$ = $element;
};

ve.ce.BranchNode.prototype.onSplice = function( index, howmany ) {
	var i,
		length,
		args = Array.prototype.slice.call( arguments, 0 );
	// Convert models to views and attach them to this node
	if ( args.length >= 3 ) {
		for ( i = 2, length = args.length; i < length; i++ ) {
			args[i] = ve.ce.factory.createNode( args[i].getType(), args[i] );
		}
	}
	var removals = this.children.splice.apply( this.children, args );
	for ( i = 0, length = removals.length; i < length; i++ ) {
		removals[i].detach();
		removals[i].removeListener( 'update', this.emitUpdate );
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
			args[i].on( 'update', this.emitUpdate );
			if ( index ) {
				$anchor.after( args[i].$ );
			} else {
				this.$.prepend( args[i].$ );
			}
		}
	}
	this.emit.apply( this, ['splice'].concat( args ) );
	if ( args.length >= 3 ) {
		for ( i = 2, length = args.length; i < length; i++ ) {
			args[i].render();
		}
	}
	this.emit( 'update' );
};

/**
 * Render content.
 * 
 * @method
 */
ve.ce.BranchNode.prototype.render = function() {
	for ( var i = 0; i < this.children.length; i++ ) {
		this.children[i].render();
	}
};

/* Inheritance */

ve.extendClass( ve.ce.BranchNode, ve.BranchNode );
ve.extendClass( ve.ce.BranchNode, ve.ce.Node );
