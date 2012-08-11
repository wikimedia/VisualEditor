/*global rangy */

/**
 * VisualEditor content editable Surface class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable surface.
 *
 * @class
 * @constructor
 * @param model {ve.dm.Surface} Model to observe
 */
ve.ce.Surface = function ( $container, model ) {
	// Inheritance
	ve.EventEmitter.call( this );

	// Properties
	this.model = model;
	this.documentView = null; // See initialization below
	this.contextView = null; // See initialization below
	this.selectionTimeout = null;
	this.$ = $container;
	this.$document = $( document );
	this.clipboard = {};
	this.render = true; // Used in ve.ce.TextNode
	this.sluggable = true;

	this.poll = {
		text: null,
		hash: null,
		node: null,
		range: null,
		rangySelection: {
			anchorNode: null,
			anchorOffset: null,
			focusNode: null,
			focusOffset: null
		},
		polling: false,
		timeout: null,
		frequency: 100
	};

	// Events
	this.model.on( 'change', ve.bind( this.onChange, this ) );
	this.on( 'contentChange', ve.bind( this.onContentChange, this ) );
	this.$.on( {
		'cut': ve.bind( this.onCut, this ),
		'copy': ve.bind( this.onCopy, this ),
		'paste': ve.bind( this.onPaste, this ),
		'dragover drop': function ( e ) {
			// Prevent content drag & drop
			e.preventDefault();
			return false;
		}
	} );
	if ( $.browser.msie ) {
		this.$.on( 'beforepaste', ve.bind( this.onPaste, this ) );
	}

	// Initialization
	try {
		document.execCommand( 'enableObjectResizing', false, false );
		document.execCommand( 'enableInlineTableEditing', false, false );
	} catch ( e ) {
		// Silently ignore
	}
	rangy.init();
	ve.ce.Surface.clearLocalStorage();

	// Must be initialized after select and transact listeners are added to model so respond first
	this.documentView = new ve.ce.Document( model.getDocument(), this );
	this.contextView = new ve.ui.Context( this );
	this.$.append( this.documentView.getDocumentNode().$ );

	// DocumentNode Events
	this.documentView.getDocumentNode().$.on( {
		'focus': ve.bind( this.documentOnFocus, this ),
		'blur': ve.bind( this.documentOnBlur, this )
	} );
};

/* Methods */

/**
 * Responds to document focus events.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.ce.Surface.prototype.documentOnFocus = function () {
	ve.log( 'documentOnFocus' );

	this.$document.off( '.ve-ce-Surface' );

	this.$document.on( {
		// key down
		'keydown.ve-ce-Surface': ve.bind( this.onKeyDown, this ),
		'keypress.ve-ce-Surface': ve.bind( this.onKeyPress, this ),
		// mouse down
		'mousedown.ve-ce-Surface': ve.bind( this.onMouseDown, this )
	} );
	this.startPolling( true );
};

/**
 * Responds to document blur events.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.ce.Surface.prototype.documentOnBlur = function () {
	ve.log( 'documentOnBlur' );

	this.$document.off( '.ve-ce-Surface' );
	this.stopPolling();
	if (
		this.contextView &&
		!this.contextView.areChildrenCurrentlyVisible()
	) {
		this.contextView.clear();
	}
};

/**
 * Responds to document mouse down events.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.ce.Surface.prototype.onMouseDown = function ( e ) {
	ve.log( 'onMouseDown' );

	if ( this.poll.polling === true ) {
		this.pollChanges();
		if ( $( e.target ).closest( '.ve-ce-documentNode' ).length === 0 ) {
			this.stopPolling();
		} else {
			this.pollChanges( true );
		}
	}

	// Block / prevent triple click
	if ( e.originalEvent.detail > 2 ) {
		e.preventDefault();
	}
};

/**
 * Responds to document key down events.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.ce.Surface.prototype.onKeyDown = function ( e ) {
	var offset,
		relativeContentOffset,
		relativeStructuralOffset,
		relativeStructuralOffsetNode,
		hasSlug,
		newOffset,
		annotations,
		annotation;
	switch ( e.keyCode ) {
		// Tab Key
		case 9:
			// If possible, trigger a list indent/outdent
			// FIXME this way of checking whether indenting is possible is extremely hacky
			// Instead, we should allow toolbar tools to subscribe to and intercept keydowns
			if ( $( '.es-toolbarButtonTool-indent' ).is( ':not(.es-toolbarButtonTool-disabled)' ) ) {
				e.preventDefault();
				if ( e.shiftKey ) {
					ve.ui.IndentationButtonTool.outdentListItem( this.model );
				} else {
					ve.ui.IndentationButtonTool.indentListItem( this.model );
				}
			}
			break;
		// Left arrow
		case 37:
			if ( !e.metaKey && !e.altKey && !e.shiftKey && this.model.getSelection().getLength() === 0 ) {
				offset = this.model.getSelection().start;
				relativeContentOffset = this.documentView.model.getRelativeContentOffset( offset, -1 );
				relativeStructuralOffset = this.documentView.model.getRelativeStructuralOffset( offset - 1, -1, true );
				relativeStructuralOffsetNode = this.documentView.documentNode.getNodeFromOffset( relativeStructuralOffset );
				hasSlug = relativeStructuralOffsetNode.hasSlugAtOffset( relativeStructuralOffset );
				if ( hasSlug ) {
					if ( relativeContentOffset > offset ) {
						newOffset = relativeStructuralOffset;
					} else {
						newOffset = Math.max( relativeContentOffset, relativeStructuralOffset );
					}
				} else {
					newOffset = Math.min( offset, relativeContentOffset );
				}
				this.model.change(
					null,
					new ve.Range( newOffset )
				);
				e.preventDefault();
			}
			break;
		// Right arrow
		case 39:
			if (
				!e.metaKey &&
				!e.altKey &&
				!e.shiftKey &&
				this.model.getSelection().getLength() === 0
			) {
				offset = this.model.getSelection().start;
				relativeContentOffset = this.documentView.model.getRelativeContentOffset( offset, 1 );
				relativeStructuralOffset = this.documentView.model.getRelativeStructuralOffset( offset + 1, 1, true );
				relativeStructuralOffsetNode = this.documentView.documentNode.getNodeFromOffset( relativeStructuralOffset );
				hasSlug = relativeStructuralOffsetNode.hasSlugAtOffset( relativeStructuralOffset );
				if ( hasSlug ) {
					if ( relativeContentOffset < offset ) {
						newOffset = relativeStructuralOffset;
					} else {
						newOffset = Math.min( relativeContentOffset, relativeStructuralOffset );
					}
				} else {
					newOffset = Math.max( offset, relativeContentOffset );
				}
				this.model.change(
					null,
					new ve.Range( newOffset )
				);
				e.preventDefault();
			}
			break;
		// Enter
		case 13:
			e.preventDefault();
			this.handleEnter( e );
			break;
		// Backspace
		case 8:
			this.handleDelete( true );
			e.preventDefault();
			break;
		// Delete
		case 46:
			this.handleDelete( false );
			e.preventDefault();
			break;
		// B
		case 66:
			if ( ve.ce.Surface.isShortcutKey( e ) ) {
				// Ctrl+B / Cmd+B, annotate with bold
				e.preventDefault();
				annotations = this.documentView.model.getAnnotationsFromRange( this.model.getSelection() );
				annotation = { 'type': 'textStyle/bold' };

				this.model.annotate( annotations[ve.getHash(annotation)] ? 'clear' : 'set', annotation );
			}
			break;
		// I
		case 73:
			if ( ve.ce.Surface.isShortcutKey( e ) ) {
				// Ctrl+I / Cmd+I, annotate with italic
				e.preventDefault();
				annotations = this.documentView.model.getAnnotationsFromRange( this.model.getSelection() );
				annotation = { 'type': 'textStyle/italic' };

				this.model.annotate( annotations[ve.getHash(annotation)] ? 'clear' : 'set', annotation );
			}
			break;
		// K
		case 75:
			if ( ve.ce.Surface.isShortcutKey( e ) ) {
				if ( this.model.getSelection() && this.model.getSelection().getLength() ) {
					e.preventDefault();
					this.contextView.openInspector( 'link' );
				}
			}
			break;
		// Z
		case 90:
			if ( ve.ce.Surface.isShortcutKey( e ) ) {
				if ( e.shiftKey ) {
					// Ctrl+Shift+Z / Cmd+Shift+Z, redo
					e.preventDefault();
					this.stopPolling();
					this.showSelection( this.model.redo() );
					this.clearPollData();
					this.startPolling();
				} else {
					// Ctrl+Z / Cmd+Z, undo
					e.preventDefault();
					this.stopPolling();
					this.showSelection( this.model.undo() );
					this.clearPollData();
					this.startPolling();
				}
			}
			break;
		default:
			if ( this.poll.polling === false ) {
				this.poll.polling = true;
				this.pollChanges();
			}
	}
};

/**
 * Responds to copy events.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.ce.Surface.prototype.onCopy = function ( e ) {
	var sel = rangy.getSelection(),
		$frag = $( sel.getRangeAt(0).cloneContents() ),
		dataArray = ve.copyArray( this.documentView.model.getData( this.model.getSelection() ) ),
		key = '';

	// Create key from text and element names
	$frag.contents().each( function () {
		key += this.textContent || this.nodeName;
	} );
	key = 've-' + key.replace( /\s/gm, '' );

	// Set clipboard and localStorage
	this.clipboard[key] = dataArray;
	try {
		localStorage.setItem(
			key,
			JSON.stringify( {
				'time': new Date().getTime(),
				'data': dataArray
			} )
		);
	} catch ( e ) {
		// Silently ignore
	}
};

/**
 * Responds to cut events.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.ce.Surface.prototype.onCut = function ( e ) {
	var surface = this;

	this.stopPolling();

	this.onCopy( e );

	setTimeout( function () {
		var	selection,
			tx;

		// We don't like how browsers cut, so let's undo it and do it ourselves.
		document.execCommand( 'undo', false, false );

		selection = surface.model.getSelection();

		// Transact
		surface.autoRender = true;
		tx = ve.dm.Transaction.newFromRemoval( surface.documentView.model, selection );
		surface.model.change( tx, new ve.Range( selection.start ) );
		surface.autoRender = false;

		surface.clearPollData();
		surface.startPolling();
	}, 1 );
};

/**
 * Responds to paste events.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.ce.Surface.prototype.onPaste = function () {
	var view = this,
		selection = this.model.getSelection(),
		tx = null;

	this.stopPolling();

	// Pasting into a range? Remove first.
	if ( !rangy.getSelection().isCollapsed ) {
		tx = ve.dm.Transaction.newFromRemoval( view.documentView.model, selection );
		view.model.change( tx );
	}

	$( '#paste' ).html( '' ).show().focus();

	setTimeout( function () {
		var key = '',
			pasteData,
			tx;

		// Create key from text and element names
		$( '#paste' ).hide().contents().each( function () {
			key += this.textContent || this.nodeName;
		} );
		key = 've-' + key.replace( /\s/gm, '' );

		// Get linear model from clipboard, localStorage, or create array from unknown pasted content
		if ( view.clipboard[key] ) {
			pasteData = view.clipboard[key];
		} else if ( localStorage.getItem( key ) ) {
			pasteData = JSON.parse( localStorage.getItem( key ) ).data;
		} else {
			pasteData = $( '#paste' ).text().split( '' );
		}

		// Transact
		tx = ve.dm.Transaction.newFromInsertion(
			view.documentView.model,
			selection.start,
			pasteData
		);
		view.model.change( tx, new ve.Range( selection.start + pasteData.length ) );
		view.documentView.documentNode.$.focus();

		view.clearPollData();
		view.startPolling();
	}, 1 );
};

/**
 * Responds to document key press events.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.ce.Surface.prototype.onKeyPress = function ( e ) {
	var node, selection, data;

	ve.log( 'onKeyPress' );

	if ( ve.ce.Surface.isShortcutKey( e ) || e.which === 13 ) {
		return;
	}

	selection = this.model.getSelection();

	if (
		selection.getLength() === 0 &&
		this.sluggable === true &&
		this.hasSlugAtOffset( selection.start )
	) {
		this.sluggable = false;
		this.stopPolling();
		if ( this.documentView.getNodeFromOffset( selection.start ).getLength() !== 0 ) {
			data = [ { 'type' : 'paragraph' }, { 'type' : '/paragraph' } ];
			this.model.change(
				ve.dm.Transaction.newFromInsertion(
					this.documentView.model,
					selection.start,
					data
				),
				new ve.Range( selection.start + 1 )
			);
			node = this.documentView.getNodeFromOffset( selection.start + 1 );
		} else {
			node = this.documentView.getNodeFromOffset( selection.start );
		}
		node.$.empty();
		// TODO: Can this be chained to the above line?
		node.$.append( document.createTextNode( '' ) );
		this.clearPollData();
		this.startPolling();
	}

	if ( selection.getLength() > 0 && e.which !== 0 ) {
		this.stopPolling();
		this.model.change(
			ve.dm.Transaction.newFromRemoval(
				this.documentView.model,
				selection
			),
			new ve.Range( selection.start )
		);
		this.clearPollData();
		this.startPolling();
	}

};

/**
 * Begins polling for changes.
 *
 * @method
 * @param {Boolean} async Allow polling to happen asynchronously
 */
ve.ce.Surface.prototype.startPolling = function ( async ) {
	ve.log( 'startPolling' );

	this.poll.polling = true;
	this.pollChanges( async );
};

/**
 * Stops polling for changes.
 *
 * @method
 */
ve.ce.Surface.prototype.stopPolling = function () {
	ve.log( 'stopPolling' );

	this.poll.polling = false;
	clearTimeout( this.poll.timeout );
};

/**
 * Clears change-polling state.
 *
 * @method
 */
ve.ce.Surface.prototype.clearPollData = function () {
	ve.log( 'clearPollData' );

	this.poll.text = null;
	this.poll.hash = null;
	this.poll.node = null;
	this.poll.rangySelection.anchorNode = null;
	this.poll.rangySelection.anchorOffset = null;
	this.poll.rangySelection.focusNode = null;
	this.poll.rangySelection.focusOffset = null;
};

/**
 * Checks if the document has changed since last poll.
 *
 * @method
 */
ve.ce.Surface.prototype.pollChanges = function ( async ) {
	var delay, node, range, rangySelection,
		$anchorNode, $focusNode,
		text, hash;

	delay = ve.bind( function ( async ) {
		if ( this.poll.polling ) {
			if ( this.poll.timeout !== null ) {
				clearTimeout( this.poll.timeout );
			}
			this.poll.timeout = setTimeout(
				ve.bind( this.pollChanges, this ), async ? 0 : this.poll.frequency
			);
		}
	}, this );

	if ( async ) {
		delay( true );
		return;
	}

	node = this.poll.node;
	range = this.poll.range;
	rangySelection = rangy.getSelection();

	if (
		rangySelection.anchorNode !== this.poll.rangySelection.anchorNode ||
		rangySelection.anchorOffset !== this.poll.rangySelection.anchorOffset ||
		rangySelection.focusNode !== this.poll.rangySelection.focusNode ||
		rangySelection.focusOffset !== this.poll.rangySelection.focusOffset
	) {
		this.poll.rangySelection.anchorNode = rangySelection.anchorNode;
		this.poll.rangySelection.anchorOffset = rangySelection.anchorOffset;
		this.poll.rangySelection.focusNode = rangySelection.focusNode;
		this.poll.rangySelection.focusOffset = rangySelection.focusOffset;

		// TODO: Optimize for the case of collapsed (rangySelection.isCollapsed) range

		$anchorNode = $( rangySelection.anchorNode ).closest( '.ve-ce-branchNode' );
		$focusNode = $( rangySelection.focusNode ).closest( '.ve-ce-branchNode' );

		if ( $anchorNode[0] === $focusNode[0] ) {
			node = $anchorNode[0];
		} else {
			node = null;
		}

		// TODO: Do we really need to figure out range even if node is null? (YES)

		range = new ve.Range(
			this.getOffset( rangySelection.anchorNode, rangySelection.anchorOffset ),
			this.getOffset( rangySelection.focusNode, rangySelection.focusOffset )
		);
	}

	// TODO: Invastigate more when and why node is null and what to do in those cases

	if ( this.poll.node !== node ) {
		if ( node === null ) {
			this.poll.text = this.poll.hash = this.poll.node = null;
		} else {
			this.poll.text = ve.ce.getDomText( node );
			this.poll.hash = ve.ce.getDomHash( node );
			this.poll.node = node;
		}
	} else {
		if ( node !== null ) {
			text = ve.ce.getDomText( node );
			hash = ve.ce.getDomHash( node );
			if ( this.poll.text !== text || this.poll.hash !== hash ) {
				this.emit(
					'contentChange',
					node,
					{
						'text': text,
						'hash': hash,
						'range': range
					},
					{
						'text': this.poll.text,
						'hash': this.poll.hash,
						'range': this.poll.range
					}
				);
				this.poll.text = text;
				this.poll.hash = hash;
			}
		}
	}

	if ( this.poll.range !== range ) {

		// TODO: Fix range
		if ( range.getLength() === 0 ) {
			range = new ve.Range( this.getNearestCorrectOffset( range.start, 1 ) );
		}

		this.model.change( null, range );
		this.poll.range = range;
	}

	delay();
};

/**
 * Responds to document content change events.
 *
 * Emitted in {ve.ce.Surface.prototype.pollChanges}.
 *
 * @method
 * @param {HTMLElement} node DOM node the change occured in
 * @param {Object} previous Old data
 * @param {Object} previous.text Old plain text content
 * @param {Object} previous.hash Old DOM hash
 * @param {Object} previous.range Old selection
 * @param {Object} next New data
 * @param {Object} next.text New plain text content
 * @param {Object} next.hash New DOM hash
 * @param {Object} next.range New selection
 */
ve.ce.Surface.prototype.onContentChange = function ( node, previous, next ) {
	var data, annotations, len,
		nodeOffset = $( node ).data( 'node' ).model.getOffset(),
		offsetDiff = (
			previous.range !== null &&
			next.range !== null &&
			previous.range.getLength() === 0 &&
			next.range.getLength() === 0
		) ? next.range.start - previous.range.start : null,
		lengthDiff = next.text.length - previous.text.length,
		fromLeft = 0,
		fromRight = 0;

	if (
		offsetDiff === lengthDiff &&
		previous.text.substring( 0, previous.range.start - nodeOffset - 1 ) ===
		next.text.substring( 0, previous.range.start - nodeOffset - 1 )
	) {
		data = next.text.substring(
				previous.range.start - nodeOffset - 1,
				next.range.start - nodeOffset - 1
			).split( '' );
		annotations = this.model.getDocument().getAnnotationsFromOffset( previous.range.start - 1 );

		if ( !ve.isEmptyObject( annotations ) ) {
			ve.dm.Document.addAnnotationsToData( data, annotations );
		}

		this.render = false;
		this.model.change(
			ve.dm.Transaction.newFromInsertion(
				this.documentView.model, previous.range.start, data
			),
			next.range
		);
		this.render = true;

	} else {
		len = Math.min( previous.text.length, next.text.length );

		while ( fromLeft < len && previous.text[fromLeft] === next.text[fromLeft] ) {
			++fromLeft;
		}
		while (
			fromRight < len - fromLeft &&
			previous.text[previous.text.length - 1 - fromRight] ===
			next.text[next.text.length - 1 - fromRight]
		) {
			++fromRight;
		}

		annotations = this.model.getDocument()
			.getAnnotationsFromOffset( nodeOffset + 1 + fromLeft );
		data = next.text.substring( fromLeft, next.text.length - fromRight ).split( '' );

		if ( !ve.isEmptyObject( annotations ) ) {
			ve.dm.Document.addAnnotationsToData( data, annotations );
		}

		this.clearPollData();

		// TODO: combine newFromRemoval and newFromInsertion into one newFromReplacement
		if ( fromLeft + fromRight < previous.text.length ) {
			this.model.change(
				ve.dm.Transaction.newFromRemoval(
					this.documentView.model,
					new ve.Range(
						nodeOffset + 1 + fromLeft, nodeOffset + 1 + previous.text.length - fromRight
					)
				),
				next.range
			);
		}
		this.model.change(
			ve.dm.Transaction.newFromInsertion(
				this.documentView.model, nodeOffset + 1 + fromLeft, data
			),
			next.range
		);
	}
	this.sluggable = true;
};

/**
 * Called from ve.dm.Surface.prototype.change.
 *
 * @method
 * @param {ve.dm.Transaction|null} transaction
 * @param {ve.Range|undefined} selection
 */
ve.ce.Surface.prototype.onChange = function ( transaction, selection ) {
	ve.log( 'onChange' );

	if ( selection ) {
		this.showSelection( selection );

		// Responsible for Debouncing the ContextView Icon until select events are finished being
		// fired.
		// TODO: Use ve.debounce method to abstract usage of setTimeout
		clearTimeout( this.selectionTimeout );
		this.selectionTimeout = setTimeout(
			ve.bind( function () {
				if ( this.contextView ) {
					if ( selection.getLength() > 0 ) {
						this.contextView.set();
					} else {
						this.contextView.clear();
					}
				}
			}, this ),
			250
		);
	}
};

/**
 * Responds to enter key events.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.ce.Surface.prototype.handleEnter = function ( e ) {
	var tx, outerParent, outerChildrenCount, list,
		selection = this.model.getSelection(),
		documentModel = this.model.getDocument(),
		emptyParagraph = [{ 'type': 'paragraph' }, { 'type': '/paragraph' }],
		advanceCursor = true,
		node = this.documentView.getNodeFromOffset( selection.from ),
		nodeModel = node.getModel(),
		cursor = selection.from,
		nodeOffset = nodeModel.getOffset(),
		contentBranchModel = nodeModel.isContent() ? nodeModel.getParent() : nodeModel,
		contentBranchModelRange = contentBranchModel.getRange(),
		stack = [],
		outermostNode = null;

	// Stop polling while we work
	this.stopPolling();

	// Handle removal first
	if ( selection.from !== selection.to ) {
		tx = ve.dm.Transaction.newFromRemoval( documentModel, selection );
		selection = tx.translateRange( selection );
		this.model.change( tx, selection );
	}

	// Handle insertion
	if (
		contentBranchModel.getType() !== 'paragraph' &&
		(
			cursor === contentBranchModelRange.from ||
			cursor === contentBranchModelRange.to
		)
	) {
		// If we're at the start/end of something that's not a paragraph, insert a paragraph
		// before/after
		if ( cursor === contentBranchModelRange.from ) {
			tx = ve.dm.Transaction.newFromInsertion(
				documentModel, contentBranchModel.getOuterRange().from, emptyParagraph
			);
		} else if ( cursor === contentBranchModelRange.to ) {
			tx = ve.dm.Transaction.newFromInsertion(
				documentModel, contentBranchModel.getOuterRange().to, emptyParagraph
			);
		}
	} else {
		// Split
		ve.Node.traverseUpstream( node, function ( node ) {
			if ( !node.canBeSplit() ) {
				return false;
			}
			stack.splice(
				stack.length / 2,
				0,
				{ 'type': '/' + node.type },
				node.model.getClonedElement()
			);
			outermostNode = node;
			if ( e.shiftKey ) {
				return false;
			} else {
				return true;
			}
		} );

		outerParent = outermostNode.getModel().getParent();
		outerChildrenCount = outerParent.getChildren().length;

		if (
			// This is a list item
			outermostNode.type === 'listItem' &&
			// This is the last list item
			outerParent.getChildren()[outerChildrenCount - 1] === outermostNode.getModel() &&
			// There is one child
			outermostNode.children.length === 1 &&
			// The child is empty
			node.model.length === 0
		) {
			// Enter was pressed in an empty list item.
			list = outermostNode.getModel().getParent();
			// Remove the list item
			tx = ve.dm.Transaction.newFromRemoval(
				documentModel, outermostNode.getModel().getOuterRange()
			);
			this.model.change( tx );
			// Insert a paragraph
			tx = ve.dm.Transaction.newFromInsertion(
				documentModel, list.getOuterRange().to, emptyParagraph
			);

			advanceCursor = false;
		} else {
			// We must process the transaction first because getRelativeContentOffset can't help us
			// yet
			tx = ve.dm.Transaction.newFromInsertion( documentModel, selection.from, stack );
			this.model.change( tx );
		}
	}

	// Now we can move the cursor forward
	if ( advanceCursor ) {
		this.model.change(
			null, new ve.Range( documentModel.getRelativeContentOffset( selection.from, 1 ) )
		);
	} else {
		this.model.change(
			null, new ve.Range( documentModel.getNearestContentOffset( selection.from ) )
		);
	}
	// Reset and resume polling
	this.clearPollData();
	this.startPolling();
};

/**
 * Responds to backspace and delete key events.
 *
 * @method
 * @param {Boolean} Key was a backspace
 */
ve.ce.Surface.prototype.handleDelete = function ( backspace ) {
	this.stopPolling();

	var selection = this.model.getSelection(),
		sourceOffset,
		targetOffset,
		sourceSplitableNode,
		targetSplitableNode,
		tx,
		cursorAt,
		sourceNode,
		targetNode,
		sourceData,
		nodeToDelete;

	if ( selection.from === selection.to ) {
		if ( backspace || selection.to === this.model.getDocument().data.length - 1) {
			sourceOffset = selection.to;
			targetOffset = this.getNearestCorrectOffset( sourceOffset - 1, -1 );
		} else {
			sourceOffset = this.model.getDocument().getRelativeContentOffset( selection.to, 1 );
			targetOffset = selection.to;
		}

		sourceNode = this.documentView.getNodeFromOffset( sourceOffset, false );
		targetNode = this.documentView.getNodeFromOffset( targetOffset, false );

		if ( sourceNode.type === targetNode.type ) {
			sourceSplitableNode = ve.ce.Node.getSplitableNode( sourceNode );
			targetSplitableNode = ve.ce.Node.getSplitableNode( targetNode );
		}
		//ve.log(sourceSplitableNode, targetSplitableNode);

		cursorAt = targetOffset;

		if (
			// Source and target are the same node
			sourceNode === targetNode ||
			(
				// Source and target have the same parent (list items)
				sourceSplitableNode !== undefined &&
				sourceSplitableNode.getParent() === targetSplitableNode.getParent()
			)
		) {
			// Simple removal
			tx = ve.dm.Transaction.newFromRemoval(
				this.documentView.model, new ve.Range( targetOffset, sourceOffset )
			);
			this.model.change( tx, new ve.Range( cursorAt ) );
		} else if ( sourceNode.getType() === 'document' ) {
			// Source is a slug - move the cursor somewhere useful
			this.model.change( null, new ve.Range( cursorAt ) );
		} else {
			// Source and target are different nodes and do not share a parent, perform tricky merge
			// Get the data for the source node
			sourceData = this.documentView.model.getData( sourceNode.model.getRange() );
			// Find the node that should be completely removed
			nodeToDelete = sourceNode;
			ve.Node.traverseUpstream( nodeToDelete, function ( node ) {
				if ( node.getParent().children.length === 1 ) {
					nodeToDelete = node.getParent();
					return true;
				} else {
					return false;
				}
			} );
			// Remove source node or source node ancestor
			this.model.change( ve.dm.Transaction.newFromRemoval(
				this.documentView.model, nodeToDelete.getModel().getOuterRange()
			) );
			// Append source data to target
			this.model.change(
				ve.dm.Transaction.newFromInsertion(
					this.documentView.model, targetOffset, sourceData
				),
				new ve.Range( cursorAt )
			);
		}
	} else {
		// Selection removal
		this.model.change(
			ve.dm.Transaction.newFromRemoval( this.documentView.model, selection ),
			new ve.Range( selection.start )
		);
	}

	this.clearPollData();
	this.startPolling();
};

/**
 * Shows the cursor at a given offset.
 *
 * @method
 * @param {Number} offset Offset to show cursor at
 */
ve.ce.Surface.prototype.showCursor = function ( offset ) {
	this.showSelection( new ve.Range( offset ) );
};

/**
 * Shows selection on a given range.
 *
 * @method
 * @param {ve.Range} range Range to show selection on
 */
ve.ce.Surface.prototype.showSelection = function ( range ) {
	var rangySel = rangy.getSelection(),
		rangyRange = rangy.createRange(),
		start,
		end;

	if ( range.start !== range.end ) {
		start = this.getNodeAndOffset( range.start );
		end = this.getNodeAndOffset( range.end );

		if ( $.browser.msie ) {
			if ( range.start === range.from ) {
				if (
					start.node === this.poll.rangySelection.anchorNode &&
					start.offset === this.poll.rangySelection.anchorOffset &&
					end.node === this.poll.rangySelection.focusNode &&
					end.offset === this.poll.rangySelection.focusOffset
				) {
					return;
				}
			} else {
				if (
					end.node === this.poll.rangySelection.anchorNode &&
					end.offset === this.poll.rangySelection.anchorOffset &&
					start.node === this.poll.rangySelection.focusNode &&
					start.offset === this.poll.rangySelection.focusOffset
				) {
					return;
				}
			}
		}

		rangyRange.setStart( start.node, start.offset );
		rangyRange.setEnd( end.node, end.offset );
		rangySel.removeAllRanges();
		rangySel.addRange( rangyRange, range.start !== range.from );
	} else {
		start = end = this.getNodeAndOffset( range.start );

		if ( $.browser.msie ) {
			if (
				start.node === this.poll.rangySelection.anchorNode &&
				start.offset === this.poll.rangySelection.anchorOffset
			) {
				return;
			}
		}

		rangyRange.setStart( start.node, start.offset );
		rangySel.setSingleRange( rangyRange );
	}
};

/**
 * Gets the nearest offset that a cursor can actually be placed at.
 *
 * TODO: Find a better name and a better place for this method
 *
 * @method
 * @param {Number} offset Offset to start looking at
 * @param {Number} [direction=-1] Direction to look in, +1 or -1
 */
ve.ce.Surface.prototype.getNearestCorrectOffset = function ( offset, direction ) {
	direction = direction > 0 ? 1 : -1;

	if (
		ve.dm.Document.isContentOffset( this.documentView.model.data, offset ) ||
		this.hasSlugAtOffset( offset )
	) {
		return offset;
	}

	var contentOffset = this.documentView.model.getNearestContentOffset( offset, direction ),
		structuralOffset =
			this.documentView.model.getNearestStructuralOffset( offset, direction, true );

	if ( !this.hasSlugAtOffset( structuralOffset ) ) {
		return contentOffset;
	}

	if ( direction === 1 ) {
		if ( contentOffset < offset ) {
			return structuralOffset;
		} else {
			return Math.min( contentOffset, structuralOffset );
		}
	} else {
		if ( contentOffset > offset ) {
			return structuralOffset;
		} else {
			return Math.max( contentOffset, structuralOffset );
		}
	}
};

/**
 * Checks if a given offset is inside a slug.
 *
 * TODO: Find a better name and a better place for this method - probably in a document view?
 *
 * @method
 * @param {Number} offset Offset to check for a slug at
 * @returns {Boolean} A slug exists at the given offset
 */
ve.ce.Surface.prototype.hasSlugAtOffset = function ( offset ) {
	var node = this.documentView.documentNode.getNodeFromOffset( offset );
	if ( node && node.canHaveChildren() ) {
		return node.hasSlugAtOffset( offset );
	} else {
		return false;
	}
};

/**
 * Gets a DOM node and offset that can be used to place a cursor, based on a given offset.
 *
 * The results of this function are meant to be used with rangy.
 *
 * @method
 * @param offset {Integer} Linear model offset
 * @returns {Object} Object containing a node and offset property where node is an HTML element and
 * offset is the position within the element
 */
ve.ce.Surface.prototype.getNodeAndOffset = function ( offset ) {
	var node = this.documentView.getNodeFromOffset( offset ),
		startOffset = this.documentView.getDocumentNode().getOffsetFromNode( node ) +
			( ( node.isWrapped() ) ? 1 : 0 ),
		current = [node.$.contents(), 0],
		stack = [current],
		item,
		$item,
		length;

	while ( stack.length > 0 ) {
		if ( current[1] >= current[0].length ) {
			stack.pop();
			current = stack[ stack.length - 1 ];
			continue;
		}
		item = current[0][current[1]];
		if ( item.nodeType === Node.TEXT_NODE ) {
			length = item.textContent.length;
			if ( offset >= startOffset && offset <= startOffset + length ) {
				return {
					node: item,
					offset: offset - startOffset
				};
			} else {
				startOffset += length;
			}
		} else if ( item.nodeType === Node.ELEMENT_NODE ) {
			$item = current[0].eq( current[1] );
			if ( $item.hasClass('ve-ce-slug') ) {
				if ( offset === startOffset ) {
					return {
						node: $item[0],
						offset: 1
					};
				}
			} else if ( $item.is( '.ve-ce-branchNode, .ve-ce-leafNode' ) ) {
				length = $item.data( 'node' ).model.getOuterLength();
				if ( offset >= startOffset && offset < startOffset + length ) {
					stack.push( [$item.contents(), 0] );
					current[1]++;
					current = stack[stack.length-1];
					continue;
				} else {
					startOffset += length;
				}
			} else {
				stack.push( [$item.contents(), 0] );
				current[1]++;
				current = stack[stack.length-1];
				continue;
			}

		}
		current[1]++;
	}
};

/**
 * Gets the linear offset from a given DOM node and offset within it.
 *
 * @method
 * @param {DOM Node} domNode DOM node
 * @param {Integer} domOffset DOM offset within the DOM Element
 * @returns {Integer} Linear model offset
 */
ve.ce.Surface.prototype.getOffset = function ( domNode, domOffset ) {
	if ( domNode.nodeType === Node.TEXT_NODE ) {
		return this.getOffsetFromTextNode( domNode, domOffset );
	} else {
		return this.getOffsetFromElementNode( domNode, domOffset );
	}
};

/**
 * Gets the linear offset from a given text node and offset within it.
 *
 * @method
 * @param {DOM Node} domNode DOM node
 * @param {Integer} domOffset DOM offset within the DOM Element
 * @returns {Integer} Linear model offset
 */
ve.ce.Surface.prototype.getOffsetFromTextNode = function ( domNode, domOffset ) {
	var $node, nodeModel, current, stack, item, offset, $item;

	$node = $( domNode ).closest(
		'.ve-ce-branchNode, .ve-ce-alienBlockNode, .ve-ce-alienInlineNode'
	);
	nodeModel = $node.data( 'node' ).getModel();

	if ( ! $node.hasClass( 've-ce-branchNode' ) ) {
		return nodeModel.getOffset();
	}

	current = [$node.contents(), 0];
	stack = [current];
	offset = 0;

	while ( stack.length > 0 ) {
		if ( current[1] >= current[0].length ) {
			stack.pop();
			current = stack[ stack.length - 1 ];
			continue;
		}
		item = current[0][current[1]];
		if ( item.nodeType === Node.TEXT_NODE ) {
			if ( item === domNode ) {
				offset += domOffset;
				break;
			} else {
				offset += item.textContent.length;
			}
		} else if ( item.nodeType === Node.ELEMENT_NODE ) {
			$item = current[0].eq( current[1] );
			if ( $item.hasClass( 've-ce-slug' ) ) {
				if ( $item.contents()[0] === domNode ) {
					break;
				}
			} else if ( $item.hasClass( 've-ce-leafNode' ) ) {
				offset += 2;
			} else if ( $item.hasClass( 've-ce-branchNode' ) ) {
				offset += $item.data( 'node' ).getOuterLength();
			} else {
				stack.push( [$item.contents(), 0 ] );
				current[1]++;
				current = stack[stack.length-1];
				continue;
			}
		}
		current[1]++;
	}
	return offset + nodeModel.getOffset() + ( nodeModel.isWrapped() ? 1 : 0 );
};

/**
 * Gets the linear offset from a given element node and offset within it.
 *
 * @method
 * @param {DOM Node} domNode DOM node
 * @param {Integer} domOffset DOM offset within the DOM Element
 * @param {Boolean} [addOuterLength] Use outer length, which includes wrappers if any exist
 * @returns {Integer} Linear model offset
 */
ve.ce.Surface.prototype.getOffsetFromElementNode = function ( domNode, domOffset, addOuterLength ) {
	var $domNode = $( domNode ),
		nodeModel,
		node;

	if ( $domNode.hasClass( 've-ce-slug' ) ) {
		if ( $domNode.prev().length ) {
			nodeModel = $domNode.prev().data( 'node' ).getModel();
			return nodeModel.getOffset() + nodeModel.getOuterLength();
		}
		if ( $domNode.next().length ) {
			nodeModel = $domNode.next().data( 'node' ).getModel();
			return nodeModel.getOffset();
		}
	}

	if ( domOffset === 0 ) {
		node = $domNode.data( 'node' );
		if ( node ) {
			nodeModel = $domNode.data( 'node' ).getModel();
			if ( addOuterLength === true ) {
				return nodeModel.getOffset() + nodeModel.getOuterLength();
			} else {
				return nodeModel.getOffset();
			}
		} else {
			node = $domNode.contents().last()[0];
		}
	} else {
		node = $domNode.contents()[ domOffset - 1 ];
	}

	if ( node.nodeType === Node.TEXT_NODE ) {
		return this.getOffsetFromTextNode( node, node.length );
	} else {
		return this.getOffsetFromElementNode( node, 0, true );
	}
};

/**
 * Updates the context icon.
 *
 * @method
 */
ve.ce.Surface.prototype.updateContextIcon = function () {
	var selection = this.model.getSelection();
	if ( this.contextView ) {
		if ( selection.getLength() > 0 ) {
			this.contextView.set();
		} else {
			this.contextView.clear();
		}
	}
};

/**
 * Gets the coordinates of the selection anchor.
 *
 * @method
 */
ve.ce.Surface.prototype.getSelectionRect = function () {
	var rangySel = rangy.getSelection();
	return {
		start: rangySel.getStartDocumentPos(),
		end: rangySel.getEndDocumentPos()
	};
};

/**
 * Tests if the modifier key for keyboard shortcuts is pressed.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.ce.Surface.isShortcutKey = function ( e ) {
	if ( e.ctrlKey || e.metaKey ) {
		return true;
	}
	return false;
};

/**
 * Removes localStorage keys for copy and paste after a day.
 *
 * @method
 */
ve.ce.Surface.clearLocalStorage = function () {
	var i, len, key,
		time, now,
		keysToRemove = [];

	for ( i = 0, len = localStorage.length; i < len; i++ ) {
		key = localStorage.key( i );

		if ( key.indexOf( 've-' ) !== 0 ) {
			return false;
		}

		time = JSON.parse( localStorage.getItem( key ) ).time;
		now = new Date().getTime();

		// Offset: 24 days (in miliseconds)
		if ( now - time > ( 24 * 3600 * 1000 ) ) {
			// Don't remove keys while iterating. Store them for later removal.
			keysToRemove.push( key );
		}
	}

	$.each( keysToRemove, function ( i, val ) {
		localStorage.removeItem( val );
	} );
};

/**
 * Gets the surface model.
 *
 * @method
 * @returns {ve.dm.Surface} Surface model
 */
ve.ce.Surface.prototype.getModel = function () {
	return this.model;
};

/**
 * Gets the document view.
 *
 * @method
 * @returns {ve.ce.Document} Document view
 */
ve.ce.Surface.prototype.getDocument = function () {
	return this.documentView;
};

/* Inheritance */

ve.extendClass( ve.ce.Surface, ve.EventEmitter );
