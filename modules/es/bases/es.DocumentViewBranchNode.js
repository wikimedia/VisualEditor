/**
 * Creates an es.DocumentViewBranchNode object.
 * 
 * @class
 * @abstract
 * @constructor
 * @extends {es.DocumentViewNode}
 * @extends {es.DocumentBranchNode}
 * @param model {es.ModelNode} Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
es.DocumentViewBranchNode = function( model, $element, horizontal ) {
	// Inheritance
	es.DocumentViewNode.call( this, model, $element );
	es.DocumentBranchNode.call( this );

	// Properties
	this.horizontal = horizontal || false;

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

/* Methods */

es.DocumentViewBranchNode.prototype.onAfterPush = function( childModel ) {
	var childView = childModel.createView();
	this.emit( 'beforePush', childView );
	childView.attach( this );
	childView.on( 'update', this.emitUpdate );
	// Update children
	this.children.push( childView );
	// Update DOM
	this.$.append( childView.$ );
	// TODO: adding and deleting classes has to be implemented for unshift, shift, splice, sort
	// and reverse as well
	if ( this.children.length === 1 ) {
		childView.$.addClass('es-viewBranchNode-firstChild');
	}
	this.emit( 'afterPush', childView );
	this.emit( 'update' );
};

es.DocumentViewBranchNode.prototype.onAfterUnshift = function( childModel ) {
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

es.DocumentViewBranchNode.prototype.onAfterPop = function() {
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

es.DocumentViewBranchNode.prototype.onAfterShift = function() {
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

es.DocumentViewBranchNode.prototype.onAfterSplice = function( index, howmany ) {
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

es.DocumentViewBranchNode.prototype.onAfterSort = function() {
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

es.DocumentViewBranchNode.prototype.onAfterReverse = function() {
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
 * Render content.
 * 
 * @method
 */
es.DocumentViewBranchNode.prototype.renderContent = function() {
	for ( var i = 0; i < this.children.length; i++ ) {
		this.children[i].renderContent();
	}
};

/**
 * Draw selection around a given range.
 * 
 * @method
 * @param {es.Range} range Range of content to draw selection around
 */
es.DocumentViewBranchNode.prototype.drawSelection = function( range ) {
	var nodes = this.selectNodes( range, true );
	for ( var i = 0; i < this.children.length; i++ ) {
		if ( nodes.length && this.children[i] === nodes[0].node ) {
			for ( var j = 0; j < nodes.length; j++ ) {
				nodes[j].node.drawSelection( nodes[j].range );
			}
			i += nodes.length - 1;
		} else {
			this.children[i].clearSelection();
		}
	}
};

/**
 * Clear selection.
 * 
 * @method
 */
es.DocumentViewBranchNode.prototype.clearSelection = function() {
	for ( var i = 0; i < this.children.length; i++ ) {
		this.children[i].clearSelection();
	}
};

/**
 * Gets the nearest offset of a rendered position.
 * 
 * @method
 * @param {es.Position} position Position to get offset for
 * @returns {Integer} Offset of position
 */
es.DocumentViewBranchNode.prototype.getOffsetFromRenderedPosition = function( position ) {
	if ( this.children.length === 0 ) {
		return 0;
	}
	var node = this.children[0];
	for ( var i = 1; i < this.children.length; i++ ) {
		if ( this.horizontal && this.children[i].$.offset().left > position.left ) {
			break;
		} else if ( !this.horizontal && this.children[i].$.offset().top > position.top ) {
			break;			
		}
		node = this.children[i];
	}
	return node.getParent().getOffsetFromNode( node, true ) +
		node.getOffsetFromRenderedPosition( position ) + 1;
};

/**
 * Gets rendered position of offset within content.
 * 
 * @method
 * @param {Integer} offset Offset to get position for
 * @returns {es.Position} Position of offset
 */
es.DocumentViewBranchNode.prototype.getRenderedPositionFromOffset = function( offset, leftBias ) {
	var node = this.getNodeFromOffset( offset, true );
	if ( node !== null ) {
		return node.getRenderedPositionFromOffset(
			offset - this.getOffsetFromNode( node, true ) - 1,
			leftBias
		);
	}
	return null;
};

es.DocumentViewBranchNode.prototype.getRenderedLineRangeFromOffset = function( offset ) {
	var node = this.getNodeFromOffset( offset, true );
	if ( node !== null ) {
		var nodeOffset = this.getOffsetFromNode( node, true );
		return es.Range.newFromTranslatedRange(
			node.getRenderedLineRangeFromOffset( offset - nodeOffset - 1 ),
			nodeOffset + 1
		);
	}
	return null;
};

/* Inheritance */

es.extendClass( es.DocumentViewBranchNode, es.DocumentViewNode );
es.extendClass( es.DocumentViewBranchNode, es.DocumentBranchNode );
