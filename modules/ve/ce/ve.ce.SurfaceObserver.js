/*global rangy */

/**
 * VisualEditor content editable Surface class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Surface observer.
 *
 * @class
 * @constructor
 * @extends {ve.EventEmitter}
 * @param {ve.ce.Document} documentView Document to observe
 */
ve.ce.SurfaceObserver = function VeCeSurfaceObserver( documentView ) {
	// Parent constructor
	ve.EventEmitter.call( this );

	// Properties
	this.documentView = documentView;
	this.polling = false;
	this.timeoutId = null;
	this.frequency = 250; //ms
	this.clear();
};

/* Inheritance */

ve.inheritClass( ve.ce.SurfaceObserver, ve.EventEmitter );

/* Methods */

/**
 * Clears polling data.
 *
 * @method
 */
ve.ce.SurfaceObserver.prototype.clear = function( ) {
	this.rangySelection = {
		anchorNode: null,
		anchorOffset: null,
		focusNode: null,
		focusOffset: null
	};
	this.range = null;
	this.node = null;
	this.text = null;
	this.hash = null;
};

/**
 * Starts polling.
 *
 * @method
 * @param {boolean} async
 */
ve.ce.SurfaceObserver.prototype.start = function( async ) {
	this.polling = true;
	this.poll( async );
};

/**
 * Stops polling.
 *
 * @method
 * @param {boolean} poll
 */
ve.ce.SurfaceObserver.prototype.stop = function( poll ) {
	if ( this.polling === true ) {
		if ( poll === true ) {
			this.poll();
		}
		this.polling = false;
		clearTimeout( this.timeoutId );
		this.timeoutId = null;
	}
};

/**
 * TODO: fixing selection in certain cases, handling selection across multiple nodes in Firefox
 *
 * @method
 * @param {boolean} async
 */
ve.ce.SurfaceObserver.prototype.poll = function( async ) {
	var delayPoll, rangySelection, range, node, nodes, text, hash;

	if ( this.timeoutId !== null ) {
		clearTimeout( this.timeoutId );
		this.timeoutId = null;
	}

	delayPoll = ve.bind( function (async ) {
		this.timeoutId = setTimeout(
			ve.bind( this.poll, this ),
			async === true ? 0 : this.frequency
		);
	}, this );

	if ( async === true ) {
		delayPoll( true );
		return;
	}

	rangySelection = rangy.getSelection();
	range = this.range;
	node = this.node;

	if (
		rangySelection.anchorNode !== this.rangySelection.anchorNode ||
		rangySelection.anchorOffset !== this.rangySelection.anchorOffset ||
		rangySelection.focusNode !== this.rangySelection.focusNode ||
		rangySelection.focusOffset !== this.rangySelection.focusOffset
	) {
		this.rangySelection.anchorNode = rangySelection.anchorNode;
		this.rangySelection.anchorOffset = rangySelection.anchorOffset;
		this.rangySelection.focusNode = rangySelection.focusNode;
		this.rangySelection.focusOffset = rangySelection.focusOffset;

		range = new ve.Range(
			ve.ce.getOffset( rangySelection.anchorNode, rangySelection.anchorOffset ),
			ve.ce.getOffset( rangySelection.focusNode, rangySelection.focusOffset )
		);

		//if ( range.getLength() === 0 ) {
			node = $( rangySelection.anchorNode ).closest( '.ve-ce-branchNode' ).data( 'node' );
			if ( node.canHaveGrandchildren() === true ) {
				node = null;
			}
		/*} else {
			nodes = this.documentView.selectNodes( range, 'branches' );
			if ( nodes.length === 1 && nodes[0].node.canHaveGrandchildren() === false ) {
				node = nodes[0].node;
			} else {
				node = null;
			}
		}*/
	}

	if ( this.node !== node ) {
		if ( node === null ) {
			this.text = null;
			this.hash = null;
			this.node = null;
		} else {
			this.text = ve.ce.getDomText( node.$[0] );
			this.hash = ve.ce.getDomHash( node.$[0] );
			this.node = node;
		}
	} else {
		if ( node !== null ) {
			text = ve.ce.getDomText( node.$[0] );
			hash = ve.ce.getDomHash( node.$[0] );
			if ( this.text !== text || this.hash !== hash ) {
				this.emit(
					'contentChange',
					node,
					{ 'text': this.text, 'hash': this.hash, 'range': this.range },
					{ 'text': text, 'hash': hash, 'range': range }
				);
				this.text = text;
				this.hash = hash;
			}
		}
	}

	if ( this.range !== range ) {
		this.emit(
			'selectionChange',
			this.range,
			range
		);
		this.range = range;
	}

	delayPoll();
};
