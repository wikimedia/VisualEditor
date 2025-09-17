/**
 * TinyVE CE Content branch node
 *
 * This is a toy version of ve.ce.ContentBranchNode and subclasses, which illustrates the main concepts
 */

/**
 * A Content branch node in the CE tree.
 *
 * This is a tree of nodes that own ContentEditable DOM nodes. There is one CE node for each
 * DM node.
 *
 * In real VE, each node type has its own subclass of `ve.ce.ContentBranchNode`, and the
 * subclasses are instantiated through a node factory so extensions can at types.
 *
 * @class
 * @see {ve.ce.ContentBranchNode}
 * @see {ve.ce.NodeFactory}
 *
 * @constructor
 * @param {tinyve.dm.ContentBranchNodeNode} model Model for which this object is a view
 * @param {tinyve.ce.Surface} surface Surface view to which this object belongs
 */
tinyve.ce.ContentBranchNode = function TinyVeCeContentBranchNode( model, surface ) {
	// Parent constructor
	tinyve.ce.ContentBranchNode.super.call( this, model, surface );

	this.$element.addClass( 'tinyve-ce-ContentBranchNode' );

	model.connect( this, { update: 'onModelUpdate' } );
};

/* Inheritance */

OO.inheritClass( tinyve.ce.ContentBranchNode, tinyve.ce.BranchNode );

/* Methods */

tinyve.ce.ContentBranchNode.prototype.initialize = function () {
	this.onModelUpdate();
};

/**
 * Re-render on model updates.
 *
 * In real VE, the `ve.dm.ContentBranchNode` has children like `ve.dm.TextNode`, and its
 * onModelUpdate method actually listens to those children.
 *
 * @see {ve.dm.ContentBranchNode#onModelUpdate}
 */
tinyve.ce.ContentBranchNode.prototype.onModelUpdate = function () {
	this.$element[ 0 ].innerHTML = this.getRenderedContents();
};

/**
 * Get an HTML rendering of the contents
 *
 * In full VE, `ve.ce.ContentBranchNode#getRenderedContents` returns a new DOM node, not a string
 *
 * @return {string} HTML rendering of the contents
 */
tinyve.ce.ContentBranchNode.prototype.getRenderedContents = function () {
	const range = this.model.getRange();
	const linearData = this.surface.model.documentModel.data.slice( range.start, range.end );
	const html = [];

	function getCloseTag( openTag ) {
		return openTag.replace( '<', '</' ).replace( /\s.*>/, '>' );
	}

	function closeAnnotations( anns ) {
		anns.forEach( ( ann ) => {
			html.push( getCloseTag( ann ) );
		} );
	}
	function openAnnotations( anns ) {
		anns.forEach( ( ann ) => {
			html.push( ann );
		} );
	}
	let currentAnnotations = [];
	linearData.forEach( ( item ) => {
		let character;
		let annotations;
		if ( Array.isArray( item ) ) {
			[ character, annotations ] = item;
		} else {
			character = item;
			annotations = [];
		}
		// Find how many annotations match
		let i = 0;
		while ( i < annotations.length && annotations[ i ] === currentAnnotations[ i ] ) {
			i++;
		}
		closeAnnotations( currentAnnotations.slice( i ) );
		openAnnotations( annotations.slice( i ) );
		currentAnnotations = annotations;
		html.push( character );
	} );
	closeAnnotations( currentAnnotations );
	return html.join( '' );
};
