/*!
 * VisualEditor ContentEditable DragDropHandler class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Drag and drop handler
 *
 * @param {ve.ce.Surface} surface
 */
ve.ce.DragDropHandler = function VeCeDragDropHandler( surface ) {
	this.surface = surface;

	this.$dropMarker = $( '<div>' ).addClass( 've-ce-surface-dropMarker oo-ui-element-hidden' );
	this.$lastDropTarget = null;
	this.lastDropPosition = null;
	this.relocatingSelection = null;
	this.relocatingNode = null;
	this.allowedFile = null;

	this.getSurface().$element.on( {
		dragstart: this.onDocumentDragStart.bind( this ),
		dragover: this.onDocumentDragOver.bind( this ),
		dragleave: this.onDocumentDragLeave.bind( this ),
		drop: this.onDocumentDrop.bind( this )
	} );
};

/* Methods */

/**
 * Get the handled surface
 *
 * @return {ve.ce.Surface}
 */
ve.ce.DragDropHandler.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Handle document drag start events.
 *
 * @param {jQuery.Event} e Drag start event
 * @fires ve.ce.Surface#relocationStart
 */
ve.ce.DragDropHandler.prototype.onDocumentDragStart = function ( e ) {
	this.getSurface().getClipboardHandler().onCopy( e );
	this.startRelocation();
};

/**
 * Handle document drag over events.
 *
 * @param {jQuery.Event} e Drag over event
 */
ve.ce.DragDropHandler.prototype.onDocumentDragOver = function ( e ) {
	const dataTransferHandlerFactory = this.getSurface().getSurface().dataTransferHandlerFactory,
		dataTransfer = e.originalEvent.dataTransfer;
	let isContent = true;

	if ( this.getSurface().isReadOnly() ) {
		return;
	}

	let nodeType;
	if ( this.relocatingNode ) {
		isContent = this.relocatingNode.isContent();
		nodeType = this.relocatingNode.getType();
	} else {
		if ( this.allowedFile === null ) {
			this.allowedFile = false;
			// If we can get file metadata, check if there is a DataTransferHandler registered
			// to handle it.
			if ( dataTransfer.items ) {
				for ( let i = 0, l = dataTransfer.items.length; i < l; i++ ) {
					const item = dataTransfer.items[ i ];
					if ( item.kind !== 'string' ) {
						const fakeItem = new ve.ui.DataTransferItem( item.kind, item.type );
						if ( dataTransferHandlerFactory.getHandlerNameForItem( fakeItem ) ) {
							this.allowedFile = true;
							break;
						}
					}
				}
			} else if ( dataTransfer.files && dataTransfer.files.length ) {
				for ( let i = 0, l = dataTransfer.files.length; i < l; i++ ) {
					const item = dataTransfer.items[ i ];
					const fakeItem = new ve.ui.DataTransferItem( item.kind, item.type );
					if ( dataTransferHandlerFactory.getHandlerNameForItem( fakeItem ) ) {
						this.allowedFile = true;
						break;
					}
				}
			} else if ( Array.prototype.indexOf.call( dataTransfer.types || [], 'Files' ) !== -1 ) {
				// Support: Firefox
				// If we have no metadata (e.g. in Firefox) assume it is droppable
				this.allowedFile = true;
			}
		}
		// this.allowedFile is cached until the next dragleave event
		if ( this.allowedFile ) {
			isContent = false;
			nodeType = 'alienBlock';
		}
	}

	function getNearestDropTarget( node ) {
		while ( node.parent && !node.parent.isAllowedChildNodeType( nodeType ) ) {
			node = node.parent;
		}
		if ( node.parent ) {
			node.parent.traverseUpstream( ( n ) => {
				if ( n.shouldIgnoreChildren() ) {
					node = null;
					return false;
				}
			} );
			return node;
		}
	}

	if ( !isContent ) {
		e.preventDefault();
		const $target = $( e.target ).closest( '.ve-ce-branchNode, .ve-ce-leafNode' );
		let $dropTarget;
		let dropPosition;
		if ( $target.length ) {
			// Find the nearest node which will accept this node type
			let dropTargetNode = getNearestDropTarget( $target.data( 'view' ) );
			if ( dropTargetNode ) {
				$dropTarget = dropTargetNode.$element;
				dropPosition = e.originalEvent.pageY - $dropTarget.offset().top > $dropTarget.outerHeight() / 2 ? 'bottom' : 'top';
			} else {
				const targetOffset = this.getSurface().getOffsetFromEventCoords( e.originalEvent );
				if ( targetOffset !== -1 ) {
					dropTargetNode = getNearestDropTarget( this.getSurface().getDocument().getBranchNodeFromOffset( targetOffset ) );
					if ( dropTargetNode ) {
						$dropTarget = dropTargetNode.$element;
						dropPosition = 'top';
					}
				}
				if ( !$dropTarget ) {
					$dropTarget = this.$lastDropTarget;
					dropPosition = this.lastDropPosition;
				}
			}
		}
		if ( this.$lastDropTarget && (
			!this.$lastDropTarget.is( $dropTarget ) || dropPosition !== this.lastDropPosition
		) ) {
			this.$dropMarker.addClass( 'oo-ui-element-hidden' );
			$dropTarget = null;
		}
		if ( $dropTarget && (
			!$dropTarget.is( this.$lastDropTarget ) || dropPosition !== this.lastDropPosition
		) ) {
			const targetPosition = $dropTarget.position();
			// Go beyond margins as they can overlap
			let top = targetPosition.top + parseFloat( $dropTarget.css( 'margin-top' ) );
			const left = targetPosition.left + parseFloat( $dropTarget.css( 'margin-left' ) );
			if ( dropPosition === 'bottom' ) {
				top += $dropTarget.outerHeight();
			}
			this.$dropMarker
				.css( {
					top: top,
					left: left
				} )
				.width( $dropTarget.outerWidth() )
				.removeClass( 'oo-ui-element-hidden' );
		}
		if ( $dropTarget !== undefined ) {
			this.$lastDropTarget = $dropTarget;
			this.lastDropPosition = dropPosition;
		}
	}
};

/**
 * Handle document drag leave events.
 *
 * @param {jQuery.Event} e Drag leave event
 */
ve.ce.DragDropHandler.prototype.onDocumentDragLeave = function () {
	this.allowedFile = null;
	if ( this.$lastDropTarget ) {
		this.$dropMarker.addClass( 'oo-ui-element-hidden' );
		this.$lastDropTarget = null;
		this.lastDropPosition = null;
	}
};

/**
 * Handle document drop events.
 *
 * Limits native drag and drop behaviour.
 *
 * @param {jQuery.Event} e Drop event
 * @fires ve.ce.Surface#relocationEnd
 */
ve.ce.DragDropHandler.prototype.onDocumentDrop = function ( e ) {
	// Properties may be nullified by other events, so cache before setTimeout
	const surfaceModel = this.getSurface().getModel(),
		$dropTarget = this.$lastDropTarget,
		dropPosition = this.lastDropPosition,
		platformKey = ve.getSystemPlatform() === 'mac' ? 'mac' : 'pc';

	// Prevent native drop event from modifying view
	e.preventDefault();

	if ( this.getSurface().isReadOnly() ) {
		return;
	}

	let targetOffset;
	// Determine drop position
	if ( $dropTarget ) {
		// Block level drag and drop: use the lastDropTarget to get the targetOffset
		if ( $dropTarget ) {
			const targetRange = $dropTarget.data( 'view' ).getModel().getOuterRange();
			if ( dropPosition === 'top' ) {
				targetOffset = targetRange.start;
			} else {
				targetOffset = targetRange.end;
			}
		} else {
			return;
		}
	} else {
		targetOffset = this.getSurface().getOffsetFromEventCoords( e.originalEvent );
		if ( targetOffset === -1 ) {
			return;
		}
	}
	const targetFragment = surfaceModel.getLinearFragment( new ve.Range( targetOffset ) );

	const targetViewNode = this.getSurface().getDocument().getBranchNodeFromOffset(
		targetFragment.getSelection().getCoveringRange().from
	);
	// TODO: Support sanitized drop on a single line node (removing line breaks)
	const isMultiline = targetViewNode.isMultiline();

	// Internal drop
	if ( this.relocatingSelection ) {
		// Get a fragment and data of the node being dragged
		const originFragment = surfaceModel.getFragment( this.relocatingSelection );
		let originData;
		if ( !isMultiline ) {
			// Data needs to be balanced to be sanitized
			const slice = this.getSurface().getModel().getDocument().shallowCloneFromRange( originFragment.getSelection().getCoveringRange() );
			const linearData = new ve.dm.ElementLinearData(
				originFragment.getDocument().getStore(),
				slice.getBalancedData()
			);
			linearData.sanitize( { singleLine: true } );
			originData = linearData.data;
			// Unwrap CBN
			if ( originData[ 0 ].type && ve.dm.nodeFactory.canNodeContainContent( originData[ 0 ].type ) ) {
				originData = originData.slice( 1, -1 );
			}
		} else {
			originData = originFragment.getData();
		}

		// Start staging so we can abort in the catch later
		surfaceModel.pushStaging();

		// Dragging performs cut-and-paste by default (remove content from old location).
		// If Ctrl on PC, or Opt (alt) on Mac, is held, it performs copy-and-paste instead.
		if ( ( platformKey === 'pc' && !e.ctrlKey ) || ( platformKey === 'mac' && !e.altKey ) ) {
			originFragment.removeContent();
		}

		try {
			// Re-insert data at new location
			targetFragment.insertContent( originData );
			surfaceModel.applyStaging();
		} catch ( error ) {
			// Insert content may throw an exception if it can't find a way
			// to fixup the insertion sensibly
			surfaceModel.popStaging();
		}

	} else {
		// External drop
		// TODO: Support sanitized external drop into single line contexts
		if ( isMultiline ) {
			this.getSurface().getClipboardHandler().onPaste( e );
		}
	}
	this.endRelocation();
};

/* Relocation */

/**
 * Start a relocation action.
 *
 * @fires ve.ce.Surface#relocationStart
 */
ve.ce.DragDropHandler.prototype.startRelocation = function () {
	// Cache the selection and selectedNode when the drag starts, to
	// avoid having to recompute them while dragging.
	this.relocatingSelection = this.getSurface().getModel().getSelection();
	this.relocatingNode = this.getSurface().getModel().getSelectedNode();
	this.getSurface().emit( 'relocationStart' );
};

/**
 * Complete a relocation action.
 *
 * @fires ve.ce.Surface#relocationEnd
 */
ve.ce.DragDropHandler.prototype.endRelocation = function () {
	this.relocatingSelection = null;
	this.relocatingNode = null;
	// Trigger a drag leave event to clear markers
	this.onDocumentDragLeave();
	this.getSurface().emit( 'relocationEnd' );
};
