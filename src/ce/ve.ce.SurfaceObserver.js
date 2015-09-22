/*!
 * VisualEditor ContentEditable Surface class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * ContentEditable surface observer.
 *
 * @class
 *
 * @constructor
 * @param {ve.ce.Surface} surface Surface to observe
 */
ve.ce.SurfaceObserver = function VeCeSurfaceObserver( surface ) {
	// Properties
	this.surface = surface;
	this.documentView = surface.getDocument();
	this.domDocument = this.documentView.getDocumentNode().getElementDocument();
	this.polling = false;
	this.disabled = false;
	this.timeoutId = null;
	this.pollInterval = 250; // ms
	this.rangeState = null;
};

/* Inheritance */

OO.initClass( ve.ce.SurfaceObserver );

/* Methods */

/**
 * Clear polling data.
 *
 * @method
 */
ve.ce.SurfaceObserver.prototype.clear = function () {
	this.rangeState = null;
};

/**
 * Detach from the document view
 *
 * @method
 */
ve.ce.SurfaceObserver.prototype.detach = function () {
	this.surface = null;
	this.documentView = null;
	this.domDocument = null;
	this.rangeState = null;
};

/**
 * Start the setTimeout synchronisation loop
 *
 * @method
 */
ve.ce.SurfaceObserver.prototype.startTimerLoop = function () {
	this.polling = true;
	this.timerLoop( true ); // will not sync immediately, because timeoutId should be null
};

/**
 * Loop once with `setTimeout`
 *
 * @method
 * @param {boolean} firstTime Wait before polling
 */
ve.ce.SurfaceObserver.prototype.timerLoop = function ( firstTime ) {
	if ( this.timeoutId ) {
		// in case we're not running from setTimeout
		clearTimeout( this.timeoutId );
		this.timeoutId = null;
	}
	if ( !firstTime ) {
		this.pollOnce();
	}
	// only reach this point if pollOnce does not throw an exception
	if ( this.pollInterval !== null ) {
		this.timeoutId = this.setTimeout(
			this.timerLoop.bind( this ),
			this.pollInterval
		);
	}
};

/**
 * Stop polling
 *
 * @method
 */
ve.ce.SurfaceObserver.prototype.stopTimerLoop = function () {
	if ( this.polling === true ) {
		this.polling = false;
		clearTimeout( this.timeoutId );
		this.timeoutId = null;
	}
};

/**
 * Disable the surface observer
 */
ve.ce.SurfaceObserver.prototype.disable = function () {
	this.disabled = true;
};

/**
 * Enable the surface observer
 */
ve.ce.SurfaceObserver.prototype.enable = function () {
	this.disabled = false;
};

/**
 * Poll for changes.
 *
 * TODO: fixing selection in certain cases, handling selection across multiple nodes in Firefox
 *
 * @method
 * @fires contentChange
 * @fires rangeChange
 */
ve.ce.SurfaceObserver.prototype.pollOnce = function () {
	this.pollOnceInternal( true );
};

/**
 * Poll to update SurfaceObserver, but don't signal any changes back to the Surface
 *
 * @method
 */
ve.ce.SurfaceObserver.prototype.pollOnceNoCallback = function () {
	this.pollOnceInternal( false );
};

/**
 * Poll to update SurfaceObserver, but only check for selection changes
 *
 * Used as an optimisation when you know the content hasn't changed
 *
 * @method
 */
ve.ce.SurfaceObserver.prototype.pollOnceSelection = function () {
	this.pollOnceInternal( true, true );
};

/**
 * Poll for changes.
 *
 * TODO: fixing selection in certain cases, handling selection across multiple nodes in Firefox
 *
 * @method
 * @private
 * @param {boolean} signalChanges If there changes are observed, call Surface#handleObservedChange
 * @param {boolean} selectionOnly Check for selection changes only
 * @fires contentChange
 * @fires rangeChange
 */
ve.ce.SurfaceObserver.prototype.pollOnceInternal = function ( signalChanges, selectionOnly ) {
	var oldState, newState,
		contentChange = null,
		branchNodeChange = null,
		rangeChange = null;

	if ( !this.domDocument || this.disabled ) {
		return;
	}

	oldState = this.rangeState;
	newState = new ve.ce.RangeState(
		oldState,
		this.documentView.getDocumentNode(),
		selectionOnly
	);

	this.rangeState = newState;

	if ( !selectionOnly && newState.node !== null && newState.contentChanged && signalChanges ) {
		contentChange = {
			node: newState.node,
			previous: { text: oldState.text, hash: oldState.hash, range: oldState.veRange },
			next: { text: newState.text, hash: newState.hash, range: newState.veRange }
		};
	}

	// TODO: Is it correct that branchNode changes are signalled even if !signalChanges ?
	if ( newState.branchNodeChanged ) {
		branchNodeChange = {
			oldBranchNode: (
				oldState && oldState.node && oldState.node.root ?
				oldState.node :
				null
			),
			newBranchNode: newState.node
		};
	}

	if ( newState.selectionChanged && signalChanges ) {
		// Caution: selectionChanged is true if the CE selection is different, which can
		// be the case even if the DM selection is unchanged. So the following line can
		// signal a range change with identical oldRange and newRange.
		rangeChange = {
			oldRange: ( oldState ? oldState.veRange : null ),
			newRange: newState.veRange
		};
	}

	if ( contentChange || branchNodeChange || rangeChange ) {
		this.surface.handleObservedChanges( contentChange, branchNodeChange, rangeChange );
	}
};

/**
 * Wrapper for setTimeout, for ease of debugging
 *
 * @param {Function} callback Callback
 * @param {number} timeout Timeout ms
 */
ve.ce.SurfaceObserver.prototype.setTimeout = function ( callback, timeout ) {
	return setTimeout( callback, timeout );
};

/**
 * Get the range last observed.
 *
 * Used when you have just polled, but don't want to wait for a 'rangeChange' event.
 *
 * @return {ve.Range|null} Range
 */
ve.ce.SurfaceObserver.prototype.getRange = function () {
	if ( !this.rangeState ) {
		return null;
	}
	return this.rangeState.veRange;
};
