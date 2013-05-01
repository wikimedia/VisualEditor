/*!
 * VisualEditor ContentEditable BranchNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable branch node.
 *
 * Branch nodes can have branch or leaf nodes as children.
 *
 * @class
 * @abstract
 * @extends ve.ce.Node
 * @mixins ve.BranchNode
 * @constructor
 * @param {ve.dm.BranchNode} model Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
ve.ce.BranchNode = function VeCeBranchNode( model, $element ) {
	// Mixin constructor
	ve.BranchNode.call( this );

	// Parent constructor
	ve.ce.Node.call( this, model, $element );

	// Properties
	this.domWrapperElementType = this.$.get( 0 ).nodeName.toLowerCase();
	this.slugs = {};

	// Events
	this.model.connect( this, { 'splice': 'onSplice' } );

	// DOM Changes
	this.$.addClass( 've-ce-branchNode' );

	// Initialization
	this.onSplice.apply( this, [0, 0].concat( model.getChildren() ) );
};

/* Inheritance */

ve.inheritClass( ve.ce.BranchNode, ve.ce.Node );

ve.mixinClass( ve.ce.BranchNode, ve.BranchNode );

/* Events */

/**
 * @event rewrap
 * @param {jQuery} $old
 * @param {jQuery} $new
 */

/* Static Properties */


/**
 * Inline slug template.
 *
 * @static
 * @property {jQuery}
 */
ve.ce.BranchNode.$inlineSlugTemplate = $( '<span>' )
	.addClass( 've-ce-slug' )
	.html( $.browser.msie ? '&nbsp;' : '&#xFEFF;' );

/**
 * Block slug template.
 *
 * @static
 * @property {jQuery}
 */
ve.ce.BranchNode.$blockSlugTemplate =
	ve.ce.BranchNode.$inlineSlugTemplate.clone().addClass( 've-ce-slugBlock' );

/* Static Methods */

/**
 * Get the appropriate element type for the DOM wrapper of a node.
 *
 * This method reads the `key` attribute from a `model` and looks up a type in the node's statically
 * defined `domWrapperElementTypes` member, which is a mapping of possible values of that attribute
 * and DOM element types.
 *
 * @method
 * @param {ve.dm.BranchNode} model Model node is based on
 * @param {string} key Attribute name to read type value from
 * @returns {string} DOM element type for wrapper
 * @throws {Error} Attribute is not defined in the model
 * @throws {Error} Attribute value is not a key in `domWrapperElementTypes`
 */
ve.ce.BranchNode.getDomWrapperType = function ( model, key ) {
	var types,
		value = model.getAttribute( key );
	if ( value === undefined ) {
		throw new Error( 'Undefined attribute: ' + key );
	}
	types = ve.ce.nodeFactory.lookup( model.getType() ).domWrapperElementTypes;
	if ( types[value] === undefined ) {
		throw new Error( 'Invalid attribute value: ' + value );
	}
	return types[value];
};

/**
 * Get a new DOM wrapper.
 *
 * This method uses #getDomWrapperType to determine the proper element type to use.
 *
 * @method
 * @param {ve.dm.BranchNode} model Model node is based on
 * @param {string} key Attribute name to read type value from
 * @returns {jQuery} Selection of DOM wrapper
 */
ve.ce.BranchNode.getDomWrapper = function ( model, key ) {
	var type = ve.ce.BranchNode.getDomWrapperType( model, key );
	return $( document.createElement( type ) );
};

/* Methods */

/**
 * Update the DOM wrapper.
 *
 * This method uses {getDomWrapperType} to determine the proper element type to use.
 *
 * WARNING: The contents, .data( 'view' ) and any classes the wrapper already has will be moved to
 * the new wrapper, but other attributes and any other information added using $.data() will be
 * lost upon updating the wrapper. To retain information added to the wrapper, subscribe to the
 * 'rewrap' event and copy information from the {$old} wrapper the {$new} wrapper.
 *
 * @method
 * @param {string} key Attribute name to read type value from
 * @emits rewrap
 */
ve.ce.BranchNode.prototype.updateDomWrapper = function ( key ) {
	var $element,
		type = ve.ce.BranchNode.getDomWrapperType( this.model, key );

	if ( type !== this.domWrapperElementType ) {
		$element = $( document.createElement( type ) );
		// Copy classes
		$element.attr( 'class', this.$.attr( 'class' ) );
		// Copy .data( 'view' )
		$element.data( 'view', this.$.data( 'view' ) );
		// Move contents
		$element.append( this.$.contents() );
		// Emit an event that can be handled to copy other things over if needed
		this.emit( 'rewrap', this.$, $element );
		// Swap elements
		this.$.replaceWith( $element );
		// Use new element from now on
		this.$ = $element;
		// Remember which type we are using now
		this.domWrapperElementType = type;
	}
};

/**
 * Handles model update events.
 *
 * @param {ve.dm.Transaction} transaction
 */
ve.ce.BranchNode.prototype.onModelUpdate = function ( transaction ) {
	this.emit( 'childUpdate', transaction );
};

/**
 * Handle splice events.
 *
 * ve.ce.Node objects are generated from the inserted ve.dm.Node objects, producing a view that's a
 * mirror of its model.
 *
 * @method
 * @param {number} index Index to remove and or insert nodes at
 * @param {number} howmany Number of nodes to remove
 * @param {ve.dm.BranchNode...} [nodes] Variadic list of nodes to insert
 */
ve.ce.BranchNode.prototype.onSplice = function ( index ) {
	var i,
		length,
		args = Array.prototype.slice.call( arguments ),
		$anchor,
		removals;
	// Convert models to views and attach them to this node
	if ( args.length >= 3 ) {
		for ( i = 2, length = args.length; i < length; i++ ) {
			args[i] = ve.ce.nodeFactory.create( args[i].getType(), args[i] );
			args[i].model.connect( this, { 'update': 'onModelUpdate' } );
		}
	}
	removals = this.children.splice.apply( this.children, args );
	for ( i = 0, length = removals.length; i < length; i++ ) {
		removals[i].model.disconnect( this, { 'update': 'onModelUpdate' } );
		removals[i].detach();
		// Update DOM
		removals[i].$.detach();
		removals[i].setLive( false );
	}
	if ( args.length >= 3 ) {
		if ( index ) {
			// Get the element before the insertion point
			$anchor = this.children[ index - 1 ].$.last();
		}
		for ( i = args.length - 1; i >= 2; i-- ) {
			args[i].attach( this );
			if ( index ) {
				$anchor.after( args[i].$ );
			} else {
				this.$.prepend( args[i].$ );
			}
			if ( this.live !== args[i].isLive() ) {
				args[i].setLive( this.live );
			}
		}
	}

	this.setupSlugs();
};

/**
 * Setup slugs where needed.
 *
 * Existing slugs will be removed before new ones are added.
 *
 * @method
 */
ve.ce.BranchNode.prototype.setupSlugs = function () {
	var key, $slug, i;

	// Remove all slugs in this branch
	for ( key in this.slugs ) {
		this.slugs[key].remove();
		delete this.slugs[key];
	}

	if ( this.canHaveChildrenNotContent() ) {
		$slug = ve.ce.BranchNode.$blockSlugTemplate.clone();
	} else {
		$slug = ve.ce.BranchNode.$inlineSlugTemplate.clone();
	}

	if ( this.getLength() === 0 ) {
		this.slugs[0] = $slug.clone().appendTo( this.$ );
	} else {
		// Iterate over all children of this branch and add slugs in appropriate places
		for ( i = 0; i < this.children.length; i++ ) {
			// First sluggable child (left side)
			if ( i === 0 && this.children[i].canHaveSlugBefore() ) {
				this.slugs[i] = $slug.clone().insertBefore( this.children[i].$.first() );
			}
			if ( this.children[i].canHaveSlugAfter() ) {
				if (
					// Last sluggable child (right side)
					i === this.children.length - 1 ||
					// Sluggable child followed by another sluggable child (in between)
					( this.children[i + 1] && this.children[i + 1].canHaveSlugBefore() )
				) {
					this.slugs[i + 1] = $slug.clone().insertAfter( this.children[i].$.last() );
				}
			}
		}
	}
};

/**
 * Get a slug at an offset.
 *
 * @method
 * @param {number} offset Offset to get slug at
 */
ve.ce.BranchNode.prototype.getSlugAtOffset = function ( offset ) {
	var i,
		startOffset = this.model.getOffset() + ( this.isWrapped() ? 1 : 0 );

	if ( offset === startOffset ) {
		return this.slugs[0] || null;
	}
	for ( i = 0; i < this.children.length; i++ ) {
		startOffset += this.children[i].model.getOuterLength();
		if ( offset === startOffset ) {
			return this.slugs[i + 1] || null;
		}
	}
};

/**
 * Set live state on child nodes.
 *
 * @method
 * @param {boolean} live New live state
 * @emits live
 */
ve.ce.BranchNode.prototype.setLive = function ( live ) {
	this.live = live;
	this.emit( 'live' );
	for ( var i = 0; i < this.children.length; i++ ) {
		this.children[i].setLive( live );
	}
};
