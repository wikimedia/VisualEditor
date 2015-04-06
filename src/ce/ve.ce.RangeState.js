/*!
 * VisualEditor Content Editable Range State class
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * ContentEditable range state (a snapshot of CE selection/content state)
 *
 * @class
 *
 * @constructor
 * @param {ve.ce.RangeState|null} old Previous range state
 * @param {ve.ce.DocumentNode} documentNode Document node
 * @param {boolean} selectionOnly The caller promises the content has not changed from old
 */
ve.ce.RangeState = function VeCeRangeState( old, documentNode, selectionOnly ) {
	/**
	 * @property {boolean} branchNodeChanged Whether the CE branch node changed
	 */
	this.branchNodeChanged = false;

	/**
	 * @property {boolean} selectionChanged Whether the DOM range changed
	 */
	this.selectionChanged = false;

	/**
	 * @property {boolean} contentChanged Whether the content changed
	 */
	this.contentChanged = false;

	/**
	 * @property {ve.Range|null} veRange The current selection range
	 */
	this.veRange = null;

	/**
	 * @property {ve.ce.BranchNode|null} node The current branch node
	 */
	this.node = null;

	/**
	 * @property {string|null} text Plain text of current branch node
	 */
	this.text = null;

	/**
	 * @property {string|null} DOM Hash of current branch node
	 */
	this.hash = null;

	this.saveState( old, documentNode, selectionOnly );
};

/* Inheritance */

OO.initClass( ve.ce.RangeState );

/* Static methods */

/**
 * Create a plain selection object equivalent to no selection
 *
 * @return {Object} Plain selection object
 */
ve.ce.RangeState.static.createNullSelection = function () {
	return {
		focusNode: null,
		focusOffset: 0,
		anchorNode: null,
		anchorOffset: 0
	};
};

/**
 * Compare two plain selection objects, checking that all values are equal
 * and all nodes are reference-equal.
 *
 * @param {Object} a First plain selection object
 * @param {Object} b First plain selection object
 * @return {boolean} Selections are identical
 */
ve.ce.RangeState.static.compareSelections = function ( a, b ) {
	return a.focusNode === b.focusNode &&
		a.focusOffset === b.focusOffset &&
		a.anchorNode === b.anchorNode &&
		a.anchorOffset === b.anchorOffset;
};

/* Methods */

/**
 * Saves a snapshot of the current range state
 * @method
 * @param {ve.ce.RangeState|null} old Previous range state
 * @param {ve.ce.DocumentNode} documentNode Document node
 * @param {boolean} selectionOnly The caller promises the content has not changed from old
 */
ve.ce.RangeState.prototype.saveState = function ( old, documentNode, selectionOnly ) {
	var $node, selection, anchorNodeChanged,
		oldSelection = old ? old.misleadingSelection : this.constructor.static.createNullSelection(),
		nativeSelection = documentNode.getElementDocument().getSelection();

	if (
		nativeSelection.rangeCount &&
		OO.ui.contains( documentNode.$element[0], nativeSelection.anchorNode, true )
	) {
		// Freeze selection out of live object.
		selection = {
			focusNode: nativeSelection.focusNode,
			focusOffset: nativeSelection.focusOffset,
			anchorNode: nativeSelection.anchorNode,
			anchorOffset: nativeSelection.anchorOffset
		};
	} else {
		// Use a blank selection if the selection is outside the document
		selection = this.constructor.static.createNullSelection();
	}

	// Get new range information
	if ( this.constructor.static.compareSelections( oldSelection, selection ) ) {
		// No change; use old values for speed
		this.selectionChanged = false;
		this.veRange = old && old.veRange;
	} else {
		this.selectionChanged = true;
		this.veRange = ve.ce.veRangeFromSelection( selection );
	}

	anchorNodeChanged = oldSelection.anchorNode !== selection.anchorNode;

	if ( !anchorNodeChanged ) {
		this.node = old && old.node;
	} else {
		$node = $( selection.anchorNode ).closest( '.ve-ce-branchNode' );
		if ( $node.length === 0 ) {
			this.node = null;
		} else {
			this.node = $node.data( 'view' );
			// Check this node belongs to our document
			if ( this.node && this.node.root !== documentNode ) {
				this.node = null;
				this.veRange = null;
			}
		}
	}

	this.branchNodeChanged = ( old && old.node ) !== this.node;

	// Compute text/hash, for change comparison
	if ( selectionOnly && !anchorNodeChanged ) {
		this.text = old.text;
		this.hash = old.hash;
	} else if ( !this.node ) {
		this.text = null;
		this.hash = null;
	} else {
		this.text = ve.ce.getDomText( this.node.$element[0] );
		this.hash = ve.ce.getDomHash( this.node.$element[0] );
	}

	// Only set contentChanged if we're still in the same branch node
	this.contentChanged =
		!selectionOnly &&
		!this.branchNodeChanged && (
			( old && old.hash ) !== this.hash ||
			( old && old.text ) !== this.text
		);

	// Save selection for future comparisons. (But it is not properly frozen, because the nodes
	// are live and mutable, and therefore the offsets may come to point to places that are
	// misleadingly different from when the selection was saved).
	this.misleadingSelection = selection;
};
