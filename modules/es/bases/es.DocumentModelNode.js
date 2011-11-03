/**
 * Creates an es.DocumentModelNode object.
 * 
 * es.DocumentModelNode is a simple wrapper around es.ModelNode, which adds functionality for model
 * nodes to be used as nodes in a space partitioning tree.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {es.DocumentNode}
 * @extends {es.EventEmitter}
 * @param {Integer|Array} contents Either Length of content or array of child nodes to append
 * @property {Integer} contentLength Length of content
 */
es.DocumentModelNode = function( type, element, contents ) {
	// Inheritance
	es.DocumentNode.call( this );
	es.EventEmitter.call( this );

	// Reusable function for passing update events upstream
	var _this = this;
	this.emitUpdate = function() {
		_this.emit( 'update' );
	};

	// Properties
	this.type = type;
	this.parent = null;
	this.root = this;
	this.element = element || null;
	this.contentLength = 0;
	if ( typeof contents === 'number' ) {
		if ( contents < 0 ) {
			throw 'Invalid content length error. Content length can not be less than 0.';
		}
		this.contentLength = contents;
	} else if ( es.isArray( contents ) ) {
		for ( var i = 0; i < contents.length; i++ ) {
			this.push( contents[i] );
		}
	}
};

/* Abstract Methods */

/**
 * Creates a view for this node.
 * 
 * @abstract
 * @method
 * @returns {es.DocumentViewNode} New item view associated with this model
 */
es.DocumentModelNode.prototype.createView = function() {
	throw 'DocumentModelNode.createView not implemented in this subclass:' + this.constructor;
};

/* Methods */

/**
 * Gets a plain object representation of the document's data.
 * 
 * The resulting object is compatible with es.DocumentModel.newFromPlainObject.
 * 
 * @method
 * @returns {Object} Plain object representation
 */
es.DocumentModelNode.prototype.getPlainObject = function() {
	var obj = { 'type': this.type };
	if ( this.element && this.element.attributes ) {
		obj.attributes = es.copyObject( this.element.attributes );
	}
	if ( this.children.length ) {
		obj.children = [];
		for ( var i = 0; i < this.children.length; i++ ) {
			obj.children.push( this.children[i].getPlainObject() );
		}
	} else if ( this.getContentLength() ) {
		obj.content = es.DocumentModel.getExpandedContentData( this.getContent() );
	}
	return obj;
};

/**
 * Adds a node to the end of this node's children.
 * 
 * @method
 * @param {es.DocumentModelNode} childModel Item to add
 * @returns {Integer} New number of children
 * @emits beforePush (childModel)
 * @emits afterPush (childModel)
 * @emits update
 */
es.DocumentModelNode.prototype.push = function( childModel ) {
	this.emit( 'beforePush', childModel );
	childModel.attach( this );
	childModel.on( 'update', this.emitUpdate );
	this.children.push( childModel );
	this.adjustContentLength( childModel.getElementLength(), true );
	this.emit( 'afterPush', childModel );
	this.emit( 'update' );
	return this.children.length;
};

/**
 * Adds a node to the beginning of this node's children.
 * 
 * @method
 * @param {es.DocumentModelNode} childModel Item to add
 * @returns {Integer} New number of children
 * @emits beforeUnshift (childModel)
 * @emits afterUnshift (childModel)
 * @emits update
 */
es.DocumentModelNode.prototype.unshift = function( childModel ) {
	this.emit( 'beforeUnshift', childModel );
	childModel.attach( this );
	childModel.on( 'update', this.emitUpdate );
	this.children.unshift( childModel );
	this.adjustContentLength( childModel.getElementLength(), true );
	this.emit( 'afterUnshift', childModel );
	this.emit( 'update' );
	return this.children.length;
};

/**
 * Removes a node from the end of this node's children
 * 
 * @method
 * @returns {es.DocumentModelNode} Removed childModel
 * @emits beforePop
 * @emits afterPop
 * @emits update
 */
es.DocumentModelNode.prototype.pop = function() {
	if ( this.children.length ) {
		this.emit( 'beforePop' );
		var childModel = this.children[this.children.length - 1];
		childModel.detach();
		childModel.removeListener( 'update', this.emitUpdate );
		this.children.pop();
		this.adjustContentLength( -childModel.getElementLength(), true );
		this.emit( 'afterPop' );
		this.emit( 'update' );
		return childModel;
	}
};

/**
 * Removes a node from the beginning of this node's children
 * 
 * @method
 * @returns {es.DocumentModelNode} Removed childModel
 * @emits beforeShift
 * @emits afterShift
 * @emits update
 */
es.DocumentModelNode.prototype.shift = function() {
	if ( this.children.length ) {
		this.emit( 'beforeShift' );
		var childModel = this.children[0];
		childModel.detach();
		childModel.removeListener( 'update', this.emitUpdate );
		this.children.shift();
		this.adjustContentLength( -childModel.getElementLength(), true );
		this.emit( 'afterShift' );
		this.emit( 'update' );
		return childModel;
	}
};

/**
 * Adds and removes nodes from this node's children.
 * 
 * @method
 * @param {Integer} index Index to remove and or insert nodes at
 * @param {Integer} howmany Number of nodes to remove
 * @param {es.DocumentModelNode} [...] Variadic list of nodes to insert
 * @returns {es.DocumentModelNode[]} Removed nodes
 * @emits beforeSplice (index, howmany, [...])
 * @emits afterSplice (index, howmany, [...])
 * @emits update
 */
es.DocumentModelNode.prototype.splice = function( index, howmany ) {
	var i,
		length,
		args = Array.prototype.slice.call( arguments, 0 ),
		diff = 0;
	this.emit.apply( this, ['beforeSplice'].concat( args ) );
	if ( args.length >= 3 ) {
		for ( i = 2, length = args.length; i < length; i++ ) {
			diff += args[i].getElementLength();
			args[i].attach( this );
		}
	}
	var removed = this.children.splice.apply( this.children, args );
	for ( i = 0, length = removed.length; i < length; i++ ) {
		diff -= removed[i].getElementLength();
		removed[i].detach();
		removed[i].removeListener( 'update', this.emitUpdate );
	}
	this.adjustContentLength( diff, true );
	this.emit.apply( this, ['afterSplice'].concat( args ) );
	this.emit( 'update' );
	return removed;
};

/**
 * Sorts this node's children.
 * 
 * @method
 * @param {Function} sortfunc Function to use when sorting
 * @emits beforeSort (sortfunc)
 * @emits afterSort (sortfunc)
 * @emits update
 */
es.DocumentModelNode.prototype.sort = function( sortfunc ) {
	this.emit( 'beforeSort', sortfunc );
	this.children.sort( sortfunc );
	this.emit( 'afterSort', sortfunc );
	this.emit( 'update' );
};

/**
 * Reverses the order of this node's children.
 * 
 * @method
 * @emits beforeReverse
 * @emits afterReverse
 * @emits update
 */
es.DocumentModelNode.prototype.reverse = function() {
	this.emit( 'beforeReverse' );
	this.children.reverse();
	this.emit( 'afterReverse' );
	this.emit( 'update' );
};

/**
 * Gets a reference to this node's parent.
 * 
 * @method
 * @returns {es.DocumentModelNode} Reference to this node's parent
 */
es.DocumentModelNode.prototype.getParent = function() {
	return this.parent;
};

/**
 * Gets the root node in the tree this node is currently attached to.
 * 
 * @method
 * @returns {es.DocumentModelNode} Root node
 */
es.DocumentModelNode.prototype.getRoot = function() {
	return this.root;
};

/**
 * Sets the root node to this and all of it's children.
 * 
 * @method
 * @param {es.DocumentModelNode} root Node to use as root
 */
es.DocumentModelNode.prototype.setRoot = function( root ) {
	this.root = root;
	for ( var i = 0; i < this.children.length; i++ ) {
		this.children[i].setRoot( root );
	}
};

/**
 * Clears the root node from this and all of it's children.
 * 
 * @method
 */
es.DocumentModelNode.prototype.clearRoot = function() {
	this.root = null;
	for ( var i = 0; i < this.children.length; i++ ) {
		this.children[i].clearRoot();
	}
};

/**
 * Attaches this node to another as a child.
 * 
 * @method
 * @param {es.DocumentModelNode} parent Node to attach to
 * @emits attach (parent)
 */
es.DocumentModelNode.prototype.attach = function( parent ) {
	this.emit( 'beforeAttach', parent );
	this.parent = parent;
	this.setRoot( parent.getRoot() );
	this.emit( 'afterAttach', parent );
};

/**
 * Detaches this node from it's parent.
 * 
 * @method
 * @emits detach
 */
es.DocumentModelNode.prototype.detach = function() {
	this.emit( 'beforeDetach' );
	this.parent = null;
	this.clearRoot();
	this.emit( 'afterDetach' );
};

/**
 * Sets the content length.
 * 
 * @method
 * @param {Integer} contentLength Length of content
 * @throws Invalid content length error if contentLength is less than 0
 */
es.DocumentModelNode.prototype.setContentLength = function( contentLength ) {
	if ( contentLength < 0 ) {
		throw 'Invalid content length error. Content length can not be less than 0.';
	}
	var diff = contentLength - this.contentLength;
	this.contentLength = contentLength;
	if ( this.parent ) {
		this.parent.adjustContentLength( diff );
	}
};

/**
 * Adjust the content length.
 * 
 * @method
 * @param {Integer} adjustment Amount to adjust content length by
 * @throws Invalid adjustment error if resulting length is less than 0
 */
es.DocumentModelNode.prototype.adjustContentLength = function( adjustment, quiet ) {
	this.contentLength += adjustment;
	// Make sure the adjustment was sane
	if ( this.contentLength < 0 ) {
		// Reverse the adjustment
		this.contentLength -= adjustment;
		// Complain about it
		throw 'Invalid adjustment error. Content length can not be less than 0.';
	}
	if ( this.parent ) {
		this.parent.adjustContentLength( adjustment, true );
	}
	if ( !quiet ) {
		this.emit( 'update' );
	}
};

/**
 * Gets the content length.
 * 
 * @method
 * @returns {Integer} Length of content
 */
es.DocumentModelNode.prototype.getContentLength = function() {
	return this.contentLength;
};

/**
 * Gets the element length.
 * 
 * @method
 * @returns {Integer} Length of content
 */
es.DocumentModelNode.prototype.getElementLength = function() {
	return this.contentLength + 2;
};

/**
 * Gets the element object.
 * 
 * @method
 * @returns {Object} Element object in linear data model
 */
es.DocumentModelNode.prototype.getElement = function() {
	return this.element;
};

/**
 * Gets the symbolic element type name.
 * 
 * @method
 * @returns {String} Symbolic name of element type
 */
es.DocumentModelNode.prototype.getElementType = function() {
	return this.element.type;
};

/**
 * Gets an element attribute value.
 * 
 * @method
 * @returns {Mixed} Value of attribute, or null if no such attribute exists
 */
es.DocumentModelNode.prototype.getElementAttribute = function( key ) {
	if ( this.element && this.element.attributes && key in this.element.attributes ) {
		return this.element.attributes[key];
	}
	return null;
};

/**
 * Gets the content length.
 * 
 * FIXME: This method makes assumptions that a node with a data property is a DocumentModel, which
 * may be an issue if sub-classes of DocumentModelNode other than DocumentModel have a data property
 * as well. A safer way of determining this would be helpful in preventing future bugs.
 * 
 * @method
 * @param {es.Range} [range] Range of content to get
 * @returns {Integer} Length of content
 */
es.DocumentModelNode.prototype.getContent = function( range ) {
	// Find root
	var root = this.data ? this : ( this.root.data ? this.root : null );

	if ( root ) {
		return root.getContentFromNode( this, range );
	}
	return [];
};

/**
 * Gets plain text version of the content within a specific range.
 * 
 * @method
 * @param {es.Range} [range] Range of text to get
 * @returns {String} Text within given range
 */
es.DocumentModelNode.prototype.getText = function( range ) {
	var content = this.getContent( range );
	// Copy characters
	var text = '';
	for ( var i = 0, length = content.length; i < length; i++ ) {
		// If not using in IE6 or IE7 (which do not support array access for strings) use this..
		// text += this.data[i][0];
		// Otherwise use this...
		text += typeof content[i] === 'string' ? content[i] : content[i][0];
	}
	return text;
};

/* Inheritance */

es.extendClass( es.DocumentModelNode, es.DocumentNode );
es.extendClass( es.DocumentModelNode, es.EventEmitter );
