/*!
 * VisualEditor content editable ContentBranchNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable node that has content nodes as its children.
 *
 * @abstract
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {string} type Symbolic name of node type
 * @param {ve.dm.BranchNode} model Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
ve.ce.ContentBranchNode = function VeCeContentBranchNode( type, model, $element ) {
	// Parent constructor
	ve.ce.BranchNode.call( this, type, model, $element );

	// Events
	this.addListenerMethod( this, 'childUpdate', 'renderContents' );

	// Initialization
	this.renderContents();
};

/* Inheritance */

ve.inheritClass( ve.ce.ContentBranchNode, ve.ce.BranchNode );

/* Methods */

ve.ce.ContentBranchNode.prototype.onSplice = function () {
	// Call parent implementation
	ve.ce.BranchNode.prototype.onSplice.apply( this, arguments );
	// Rerender to make sure annotations are applied correctly
	this.renderContents();
};

ve.ce.ContentBranchNode.prototype.getRenderedContents = function () {
	var i, j, open, close, startedClosing, arr, annotation, itemAnnotations, itemHtml, $wrapper,
		html = '', annotationStack = new ve.AnnotationSet(), annotatedHtml = [];

	function openAnnotations( annotations ) {
		var out = '',
			annotation, i, arr, rendered;
		arr = annotations.get();
		for ( i = 0; i < arr.length; i++ ) {
			annotation = arr[i];
			rendered = annotation.renderHTML();
			out += ve.getOpeningHtmlTag( rendered.tag, rendered.attributes );
			annotationStack.push( annotation );
		}
		return out;
	}

	function closeAnnotations( annotations ) {
		var out = '',
			annotation, i, arr;
		arr = annotations.get();
		for ( i = 0; i < arr.length; i++ ) {
			annotation = arr[i];
			out += '</' + annotation.renderHTML().tag + '>';
			annotationStack.remove( annotation );
		}
		return out;
	}

	// Gather annotated HTML from the child nodes
	for ( i = 0; i < this.children.length; i++ ) {
		annotatedHtml = annotatedHtml.concat( this.children[i].getAnnotatedHtml() );
	}

	// Render HTML with annotations
	for ( i = 0; i < annotatedHtml.length; i++ ) {
		if ( ve.isArray( annotatedHtml[i] ) ) {
			itemHtml = annotatedHtml[i][0];
			itemAnnotations = annotatedHtml[i][1];
		} else {
			itemHtml = annotatedHtml[i];
			itemAnnotations = new ve.AnnotationSet();
		}
		open = new ve.AnnotationSet();
		close = new ve.AnnotationSet();

		// Go through annotationStack from bottom to top (left to right), and
		// close all annotations starting at the first one that's in annotationStack but
		// not in itemAnnotations. Then reopen the ones that are in itemAnnotations.
		startedClosing = false;
		arr = annotationStack.get();
		for ( j = 0; j < arr.length; j++ ) {
			annotation = arr[j];
			if (
				!startedClosing &&
				annotationStack.contains( annotation ) &&
				!itemAnnotations.contains( annotation )
			) {
				startedClosing = true;
			}
			if ( startedClosing ) {
				// Because we're processing these in reverse order, we need
				// to put these in close in reverse order
				close.add( annotation, 0 );
				if ( itemAnnotations.contains( annotation ) ) {
					// open needs to be reversed with respect to close
					open.push( annotation );
				}
			}
		}

		// Open all annotations that are in right but not in left
		open.addSet( itemAnnotations.diffWith( annotationStack ) );

		// Output the annotation closings and openings
		html += closeAnnotations( close );
		html += openAnnotations( open );
		// Output the actual HTML
		if ( typeof itemHtml === 'string' ) {
			// Output it directly
			html += itemHtml;
		} else {
			// itemHtml is a jQuery object, output a placeholder
			html += '<div class="ve-ce-contentBranch-placeholder" rel="' + i + '"></div>';
		}
	}
	// Close all remaining open annotations
	html += closeAnnotations( annotationStack.reversed() );

	$wrapper = $( '<div>' ).html( html );
	// Replace placeholders
	$wrapper.find( '.ve-ce-contentBranch-placeholder' ).each( function() {
		var $this = $( this ), item = annotatedHtml[$this.attr( 'rel' )];
		$this.replaceWith( ve.isArray( item ) ? item[0] : item );
	} );

	return $wrapper.contents();
};

ve.ce.ContentBranchNode.prototype.renderContents = function () {
	if ( this.root instanceof ve.ce.DocumentNode && !this.root.getSurface().isRenderingEnabled() ) {
		return;
	}

	// Detach all child nodes from this.$
	// We can't use this.$.empty() because that destroys .data() and event handlers
	this.$.contents().each( function () {
		$(this).detach();
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
