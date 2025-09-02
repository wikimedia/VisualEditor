/**
 * TinyVE CE Surface - ContentEditable representation of the surface
 *
 * This is a toy version of ve.ce.Surface which illustrates the main concepts
 */

/**
 * ContentEditable representation of the surface
 *
 * @class
 *
 * @constructor
 * @param {tinyve.dm.Surface} model The surface model
 * @param {tinyve.ui.Surface} ui The top-level surface object
 */
tinyve.ce.Surface = function TinyVeCeSurface( model, ui ) {
	// Parent constructor
	tinyve.ce.Surface.super.call( this );

	/**
	 * @property {tinyve.dm.Surface} model The surface model
	 */
	this.model = model;

	/**
	 * @property {tinyve.ui.Surface} surface The top-level surface object
	 */
	this.surface = ui;

	/**
	 * @property {tinyve.ce.Document} documentView the CE document view
	 */
	this.documentView = new tinyve.ce.Document( model.documentModel, this );

	/**
	 * @property {number} renderLock If > 0, don't render model changes
	 *
	 * Used to stop changes detected in the contentEditable surface from propagating
	 * back from the model
	 */
	this.renderLock = 0;

	this.$element.addClass( 'tinyve-ce-Surface' );
	this.$element.prop( 'contentEditable', true );
	this.$element.append( this.documentView.documentNode.$element );
	this.$element.on( 'input', this.onDocumentInput.bind( this ) );
	this.$element.on( 'keydown', this.onDocumentKeyDown.bind( this ) );
	$( document ).on( 'selectionchange', this.onDocumentSelectionChange.bind( this ) );

	this.surfaceObserver = new tinyve.ce.SurfaceObserver( this );
};

/* Inheritance */

OO.inheritClass( tinyve.ce.Surface, OO.ui.Element );

/* Methods */

/**
 * Create a view node to represent a model node in the DOM
 *
 * In full VE, this is done with a view factory so extensions can add types
 *
 * @param {tinyve.dm.Node} model The model node
 * @return {tinyve.ce.Node} View node to represent the model node in the DOM
 */
tinyve.ce.Surface.prototype.buildNode = function ( model ) {
	if ( model instanceof tinyve.dm.ContentBranchNode ) {
		return new tinyve.ce.ContentBranchNode( model, this );
	} else if ( model instanceof tinyve.dm.BranchNode ) {
		return new tinyve.ce.BranchNode( model, this );
	} else {
		throw new Error( 'Unsupported node' );
	}
};

/**
 * Handle an input event
 *
 * @param {jQuery.Event} e The input event
 */
tinyve.ce.Surface.prototype.onDocumentInput = function () {
	this.incRenderLock();
	try {
		this.surfaceObserver.pollOnce();
	} finally {
		this.decRenderLock();
	}
};

/**
 * Handle a keydown event
 *
 * @param {jQuery.Event} e The input event
 */
tinyve.ce.Surface.prototype.onDocumentKeyDown = function ( e ) {
	if ( e.keyCode === 13 ) {
		// Disable Enter press, because ContentEditable Enter handling is too messy
		// and inconsistent to fix up.
		//
		// In full VE, `ve.dm.LinearEnterKeyDownHandler` contains complex logic to
		// split nodes appropriately when Enter is pressed.
		e.preventDefault();
	}
};

/**
 * Handle a selection event
 *
 * @param {jQuery.Event} e The selection event
 */
tinyve.ce.Surface.prototype.onDocumentSelectionChange = function () {
	this.surfaceObserver.pollOnceNoCallback();
};

/**
 * Add a single render lock (to disable re-rendering)
 */
tinyve.ce.Surface.prototype.incRenderLock = function () {
	this.renderLock++;
};

/**
 * Remove a single render lock
 */
tinyve.ce.Surface.prototype.decRenderLock = function () {
	this.renderLock--;
};

/**
 * Handle the changes from contentEditable editing observed inside a ContentBranchNode
 *
 * @param {tinyve.ce.ContentBranchNode} contentBranchNode The ContentBranchNode in its current state
 * @param {Node} oldState A clone of the contentBranchNode's DOM element in its prior state
 */
tinyve.ce.Surface.prototype.handleObservedChanges = function ( contentBranchNode, oldState ) {
	const oldLinearData = tinyve.dm.converter.linearize( oldState );
	const newLinearData = tinyve.dm.converter.linearize( contentBranchNode.$element[ 0 ] );
	let offset = contentBranchNode.model.getOffset();
	// Strip common start
	while ( oldLinearData.length > 0 && OO.compare( oldLinearData[ 0 ], newLinearData[ 0 ] ) ) {
		oldLinearData.splice( 0, 1 );
		newLinearData.splice( 0, 1 );
		offset++;
	}
	// Strip common end
	while ( oldLinearData.length > 0 && OO.compare( oldLinearData.slice( -1 ), newLinearData.slice( -1 ) ) ) {
		oldLinearData.splice( -1, 1 );
		newLinearData.splice( -1, 1 );
	}
	const tx = new tinyve.dm.Transaction( [
		{ type: 'retain', length: offset },
		{ type: 'replace', remove: oldLinearData, insert: newLinearData }
	] );
	this.model.documentModel.commit( tx );
};
