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
	this.$slugs = $();

	// Events
	this.model.addListenerMethod( this, 'splice', 'onSplice' );

	// DOM Changes
	this.$.addClass( 've-ce-branchNode' );

	// Initialization
	if ( model.getChildren().length ) {
		this.onSplice.apply( this, [0, 0].concat( model.getChildren() ) );
	}
};

/* Static Members */

ve.ce.BranchNode.$slugTemplate = $( '<span class="ve-ce-slug">&#xFEFF;</span>' );

/* Static Methods */

/**
 * Gets the appropriate element type for the DOM wrapper of a node.
 *
 * This method reads the {key} attribute from a {model} and looks up a type in the node's statically
 * defined {domWrapperElementTypes} member, which is a mapping of possible values of that attribute
 * and DOM element types.
 *
 * @method
 * @param {ve.dm.BranchNode} model Model node is based on
 * @param {String} key Attribute name to read type value from
 * @returns {String} DOM element type for wrapper
 * @throws 'Undefined attribute' if attribute is not defined in the model
 * @throws 'Invalid attribute value' if attribute value is not a key in {domWrapperElementTypes}
 */
ve.ce.BranchNode.getDomWrapperType = function( model, key ) {
	var value = model.getAttribute( key );
	if ( value === undefined ) {
		throw 'Undefined attribute: ' + key;
	}
	var types = ve.ce.nodeFactory.lookup( model.getType() ).domWrapperElementTypes;
	if ( types[value] === undefined ) {
		throw 'Invalid attribute value: ' + value;
	}
	return types[value];
};

/**
 * Gets a jQuery selection of a new DOM wrapper for a node.
 *
 * This method uses {getDomWrapperType} to determine the proper element type to use.
 *
 * @method
 * @param {ve.dm.BranchNode} model Model node is based on
 * @param {String} key Attribute name to read type value from
 * @returns {jQuery} Selection of DOM wrapper
 */
ve.ce.BranchNode.getDomWrapper = function( model, key ) {
	var type = ve.ce.BranchNode.getDomWrapperType( model, key );
	return $( '<' + type + '></' + type + '>' );
};

/* Methods */

/**
 * Updates the DOM wrapper of this node if needed.
 *
 * This method uses {getDomWrapperType} to determine the proper element type to use.
 *
 * WARNING: The contents, .data( 'node' ) and any classes the wrapper already has will be moved to
 * the new wrapper, but other attributes and any other information added using $.data() will be
 * lost upon updating the wrapper. To retain information added to the wrapper, subscribe to the
 * 'rewrap' event and copy information from the {$old} wrapper the {$new} wrapper.
 *
 * @method
 * @param {String} key Attribute name to read type value from
 * @emits rewrap ($old, $new)
 */
ve.ce.BranchNode.prototype.updateDomWrapper = function( key ) {
	var type = ve.ce.BranchNode.getDomWrapperType( this.model, key );
	if ( type !== this.domWrapperElementType ) {
		var $element = $( '<' + type + '></' + type + '>' );
		// Copy classes
		$element.attr( 'class', this.$.attr( 'class' ) );
		// Copy .data( 'node' )
		$element.data( 'node', this.$.data( 'node' ) );
		// Move contents
		$element.append( this.$.contents() );
		// Emit an event that can be handled to copy other things over if needed
		this.emit( 'rewrap', this.$, $element );
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
			args[i] = ve.ce.nodeFactory.create( args[i].getType(), args[i] );
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
			$anchor = this.$.children(':not(.ve-ce-slug)').eq( index - 1 );
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

	// Remove all slugs in this branch
	this.$slugs.remove();

	var $slug = ve.ce.BranchNode.$slugTemplate.clone();

	if ( this.canHaveGrandchildren() ) {
		$slug.css( 'display', 'block');
	}

	// Iterate over all children of this branch and add slugs in appropriate places
	for ( i = 0; i < this.children.length; i++ ) {
		if ( this.children[i].canHaveSlug() ) {
			if ( i === 0 ) {
				// First sluggable child (left side)
				this.$slugs = this.$slugs.add(
					$slug.clone().insertBefore( this.children[i].$ )
				);
			}
			if (
				// Last sluggable child (right side)
				i === this.children.length - 1 ||
				// Sluggable child followed by another sluggable child (in between)
				( this.children[i + 1] && this.children[i + 1].canHaveSlug() )
			) {
				this.$slugs = this.$slugs.add(
					$slug.clone().insertAfter( this.children[i].$ )
				);
			}
		}
	}
};

ve.ce.BranchNode.prototype.hasSlugAtOffset = function( offset ) {
	for ( var i = 0; i < this.children.length; i++ ) {
		if ( this.children[i].canHaveSlug() ) {
			var nodeOffset = this.children[i].model.getRoot().getOffsetFromNode( this.children[i].model );
			var nodeLength = this.children[i].model.getOuterLength();
			if ( i === 0 ) {
				if ( nodeOffset === offset ) {
					return true;
				}
			}
			if ( i === this.children.length - 1 || ( this.children[i + 1] && this.children[i + 1].canHaveSlug() ) ) {
				if ( nodeOffset + nodeLength === offset ) {
					return true;
				}
			}
		}
	}
	return false;
};

ve.ce.BranchNode.prototype.clean = function() {
	this.$.empty();
	for ( var i = 0; i < this.children.length; i++ ) {
		this.$.append( this.children[i].$ );
	}
};

/* Inheritance */

ve.extendClass( ve.ce.BranchNode, ve.BranchNode );
ve.extendClass( ve.ce.BranchNode, ve.ce.Node );
