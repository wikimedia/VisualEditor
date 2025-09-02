/**
 * TinyVE CE Surface observer - detects changes in the contentEditable surface
 *
 * This is a toy version of ve.ce.SurfaceObserver which illustrates the main concepts
 */

/**
 * ContentEditable surface observer.
 *
 * @class
 *
 * @constructor
 * @param {tinyve.ce.Surface} surface Surface to observe
 */
tinyve.ce.SurfaceObserver = function TinyVeCeSurfaceObserver( surface ) {
	this.surface = surface;
	this.domDocument = surface;
	this.contentBranchDomNode = undefined;
	this.oldState = undefined;
};

/* Inheritance */

OO.initClass( tinyve.ce.SurfaceObserver );

/* Methods */

tinyve.ce.SurfaceObserver.prototype.pollOnce = function ( signalChanges = true ) {
	const contentBranchDomNode = $( window.getSelection().focusNode ).closest( '.tinyve-ce-ContentBranchNode' )[ 0 ];
	if ( !contentBranchDomNode ) {
		this.contentBranchDomNode = undefined;
		this.oldState = undefined;
		return;
	}
	if ( contentBranchDomNode === this.contentBranchDomNode ) {
		// Same contentBranchNode as before, so we can compare contents
		if ( signalChanges && this.oldState && !this.oldState.isEqualNode( contentBranchDomNode ) ) {
			const contentBranchNode = $.data( contentBranchDomNode, 'view' );
			this.surface.handleObservedChanges( contentBranchNode, this.oldState );
		}
	}
	this.contentBranchDomNode = contentBranchDomNode;
	this.oldState = contentBranchDomNode.cloneNode( true );
};

tinyve.ce.SurfaceObserver.prototype.pollOnceNoCallback = function () {
	this.pollOnce( false );
};
