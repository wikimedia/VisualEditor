/*!
 * VisualEditor ContentEditable ContentBranchNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable content branch node.
 *
 * Content branch nodes can only have content nodes as children.
 *
 * @abstract
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.BranchNode} model Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
ve.ce.ContentBranchNode = function VeCeContentBranchNode( model, $element ) {
	// Parent constructor
	ve.ce.BranchNode.call( this, model, $element );

	// Properties
	this.surfaceModelState = null;

	// Events
	this.connect( this, { 'childUpdate': 'onChildUpdate' } );

	// Initialization
	this.renderContents();
};

/* Inheritance */

ve.inheritClass( ve.ce.ContentBranchNode, ve.ce.BranchNode );

/* Methods */

/**
 * Handle splice events.
 *
 * Rendering is only done once per transaction. If a paragraph has multiple nodes in it then it's
 * possible to receive multiple `childUpdate` events for a single transaction such as annotating
 * across them. State is tracked by storing and comparing the length of the surface model's complete
 * history.
 *
 * This is used to automatically render contents.
 * @see ve.ce.BranchNode#onSplice
 *
 * @method
 */
ve.ce.ContentBranchNode.prototype.onChildUpdate = function ( transaction ) {
	var surfaceModel = this.getRoot().getSurface().getModel(),
		surfaceModelState = surfaceModel.getCompleteHistoryLength();

	if ( transaction instanceof ve.dm.Transaction ) {
		if ( surfaceModelState === this.surfaceModelState ) {
			return;
		}
		this.surfaceModelState = surfaceModelState;
	}
	this.renderContents();
};

/**
 * Handle splice events.
 *
 * This is used to automatically render contents.
 * @see ve.ce.BranchNode#onSplice
 *
 * @method
 */
ve.ce.ContentBranchNode.prototype.onSplice = function () {
	// Call parent implementation
	ve.ce.BranchNode.prototype.onSplice.apply( this, arguments );
	// Rerender to make sure annotations are applied correctly
	this.renderContents();
};

/**
 * Get an HTML rendering of the contents.
 *
 * @method
 * @returns {jQuery}
 */
ve.ce.ContentBranchNode.prototype.getRenderedContents = function () {
	var i, itemHtml, itemAnnotations, $ann,
		store = this.model.doc.getStore(),
		annotationStack = new ve.dm.AnnotationSet( store ),
		annotatedHtml = [],
		$wrapper = $( '<div>' ),
		$current = $wrapper,
		buffer = '';

	function flushBuffer() {
		if ( buffer !== '' ) {
			$current.append( buffer );
			buffer = '';
		}
	}

	function openAnnotation( annotation ) {
		flushBuffer();
		// Create a new DOM node and descend into it
		$ann = ve.ce.annotationFactory.create( annotation.getType(), annotation ).$;
		$current.append( $ann );
		$current = $ann;
	}

	function closeAnnotation() {
		flushBuffer();
		// Traverse up
		$current = $current.parent();
	}

	// Gather annotated HTML from the child nodes
	for ( i = 0; i < this.children.length; i++ ) {
		annotatedHtml = annotatedHtml.concat( this.children[i].getAnnotatedHtml() );
	}

	// Render HTML with annotations
	for ( i = 0; i < annotatedHtml.length; i++ ) {
		if ( ve.isArray( annotatedHtml[i] ) ) {
			itemHtml = annotatedHtml[i][0];
			itemAnnotations = new ve.dm.AnnotationSet( store, annotatedHtml[i][1] );
		} else {
			itemHtml = annotatedHtml[i];
			itemAnnotations = new ve.dm.AnnotationSet( store );
		}

		ve.dm.Converter.openAndCloseAnnotations( annotationStack, itemAnnotations,
			openAnnotation, closeAnnotation
		);

		// Handle the actual HTML
		if ( typeof itemHtml === 'string' ) {
			buffer += itemHtml;
		} else {
			flushBuffer();
			$current.append( itemHtml );
		}
	}
	flushBuffer();
	return $wrapper.contents();

};

/**
 * Render contents.
 *
 * @method
 */
ve.ce.ContentBranchNode.prototype.renderContents = function () {
	if ( this.root instanceof ve.ce.DocumentNode && !this.root.getSurface().isRenderingEnabled() ) {
		return;
	}

	// Detach all child nodes from this.$
	// We can't use this.$.empty() because that destroys .data() and event handlers
	this.$.contents().each( function () {
		$( this ).detach();
	} );

	// Reattach child nodes with the right annotations
	this.$.append( this.getRenderedContents() );

	// Add slugs
	this.setupSlugs();

	// Highlight the node in debug mode
	if ( ve.debug ) {
		this.$.css( 'backgroundColor', '#F6F6F6' );
		setTimeout( ve.bind( function () {
			this.$.css( 'backgroundColor', 'transparent' );
		}, this ), 350 );
	}
};
