/**
 * Creates an es.DocumentViewNode object.
 * 
 * es.DocumentViewNode extends native JavaScript Array objects, without changing Array.prototype by
 * dynamically extending an array literal with the methods of es.DocumentViewNode.
 * 
 * View nodes follow the operations performed on model nodes and keep elements in the DOM in sync.
 * 
 * Child objects must extend es.DocumentViewNode.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentNode}
 * @extends {es.EventEmitter}
 * @param model {es.ModelNode} Model to observe
 * @param {jQuery} [$element=New DIV element] Element to use as a container
 * @property {es.ModelItem} model Model being observed
 * @property {jQuery} $ Container element
 */
es.DocumentViewNode = function( model, $element ) {
	// Inheritance
	es.DocumentNode.call( this );
	es.EventEmitter.call( this );
	
	// Properties
	this.model = model;
	this.children = [];
	this.$ = $element || $( '<div/>' );

	// Reusable function for passing update events upstream
	var _this = this;
	this.emitUpdate = function() {
		_this.emit( 'update' );
	};

	if ( model ) {
		// Append existing model children
		var childModels = model.getChildren();
		for ( var i = 0; i < childModels.length; i++ ) {
			this.onAfterPush( childModels[i] );
		}

		// Observe and mimic changes on model
		this.addListenerMethods( this, {
			'afterPush': 'onAfterPush',
			'afterUnshift': 'onAfterUnshift',
			'afterPop': 'onAfterPop',
			'afterShift': 'onAfterShift',
			'afterSplice': 'onAfterSplice',
			'afterSort': 'onAfterSort',
			'afterReverse': 'onAfterReverse'
		} );
	}
};

es.DocumentViewNode.prototype.onAfterPush = function( childModel ) {
	var childView = childModel.createView();
	this.emit( 'beforePush', childView );
	childView.attach( this );
	childView.on( 'update', this.emitUpdate );
	// Update children
	this.children.push( childView );
	// Update DOM
	this.$.append( childView.$ );
	this.emit( 'afterPush', childView );
	this.emit( 'update' );
};

es.DocumentViewNode.prototype.onAfterUnshift = function( childModel ) {
	var childView = childModel.createView();
	this.emit( 'beforeUnshift', childView );
	childView.attach( this );
	childView.on( 'update', this.emitUpdate );
	// Update children
	this.children.unshift( childView );
	// Update DOM
	this.$.prepend( childView.$ );
	this.emit( 'afterUnshift', childView );
	this.emit( 'update' );
};

es.DocumentViewNode.prototype.onAfterPop = function() {
	this.emit( 'beforePop' );
	// Update children
	var childView = this.children.pop();
	childView.detach();
	childView.removeEventListener( 'update', this.emitUpdate );
	// Update DOM
	childView.$.detach();
	this.emit( 'afterPop' );
	this.emit( 'update' );
};

es.DocumentViewNode.prototype.onAfterShift = function() {
	this.emit( 'beforeShift' );
	// Update children
	var childView = this.children.shift();
	childView.detach();
	childView.removeEventListener( 'update', this.emitUpdate );
	// Update DOM
	childView.$.detach();
	this.emit( 'afterShift' );
	this.emit( 'update' );
};

es.DocumentViewNode.prototype.onAfterSplice = function( index, howmany ) {
	var args = Array.prototype.slice( arguments, 0 );
	this.emit.apply( ['beforeSplice'].concat( args ) );
	// Update children
	this.splice.apply( this, args );
	// Update DOM
	this.$.children()
		// Removals
		.slice( index, index + howmany )
			.detach()
			.end()
		// Insertions
		.get( index )
			.after( $.map( args.slice( 2 ), function( childView ) {
				return childView.$;
			} ) );
	this.emit.apply( ['afterSplice'].concat( args ) );
	this.emit( 'update' );
};

es.DocumentViewNode.prototype.onAfterSort = function() {
	this.emit( 'beforeSort' );
	var childModels = this.model.getChildren();
	for ( var i = 0; i < childModels.length; i++ ) {
		for ( var j = 0; j < this.children.length; j++ ) {
			if ( this.children[j].getModel() === childModels[i] ) {
				var childView = this.children[j];
				// Update children
				this.children.splice( j, 1 );
				this.children.push( childView );
				// Update DOM
				this.$.append( childView.$ );
			}
		}
	}
	this.emit( 'afterSort' );
	this.emit( 'update' );
};

es.DocumentViewNode.prototype.onAfterReverse = function() {
	this.emit( 'beforeReverse' );
	// Update children
	this.reverse();
	// Update DOM
	this.$.children().each( function() {
		$(this).prependTo( $(this).parent() );
	} );
	this.emit( 'afterReverse' );
	this.emit( 'update' );
};

/**
 * Gets a reference to the model this node observes.
 * 
 * @method
 * @returns {es.ModelNode} Reference to the model this node observes
 */
es.DocumentViewNode.prototype.getModel = function() {
	return this.model;
};

/**
 * Gets a reference to this node's parent.
 * 
 * @method
 * @returns {es.DocumentViewNode} Reference to this node's parent
 */
es.DocumentViewNode.prototype.getParent = function() {
	return this.parent;
};

/**
 * Attaches node as a child to another node.
 * 
 * @method
 * @param {es.DocumentViewNode} parent Node to attach to
 * @emits attach (parent)
 */
es.DocumentViewNode.prototype.attach = function( parent ) {
	this.parent = parent;
	this.emit( 'attach', parent );
};

/**
 * Detaches node from it's parent.
 * 
 * @method
 * @emits detach (parent)
 */
es.DocumentViewNode.prototype.detach = function() {
	var parent = this.parent;
	this.parent = null;
	this.emit( 'detach', parent );
};

/* Inheritance */

es.extendClass( es.DocumentViewNode, es.DocumentNode );
es.extendClass( es.DocumentViewNode, es.EventEmitter );
