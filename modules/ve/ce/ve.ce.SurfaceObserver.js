/*global rangy */

/*!
 * VisualEditor ContentEditable Surface class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable surface observer.
 *
 * @class
 * @extends ve.EventEmitter
 * @constructor
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

	// Initialization
	this.clear();
};

/* Inheritance */

ve.inheritClass( ve.ce.SurfaceObserver, ve.EventEmitter );

/* Methods */

/**
 * Clear polling data.
 *
 * @method
 * @param {ve.Range} range Initial range to use
 */
ve.ce.SurfaceObserver.prototype.clear = function ( range ) {
	this.rangySelection = {
		anchorNode: null,
		anchorOffset: null,
		focusNode: null,
		focusOffset: null
	};
	this.range = range || null;
	this.node = null;
	this.text = null;
	this.hash = null;
};

/**
 * Start polling.
 *
 * If {async} is false or undefined the first poll cycle will occur immediately and synchronously.
 *
 * @method
 * @param {boolean} async Poll the first time asynchronously
 */
ve.ce.SurfaceObserver.prototype.start = function ( async ) {
	this.polling = true;
	this.poll( async );
};

/**
 * Stop polling.
 *
 * If {poll} is false or undefined than no final poll cycle will occur and changes can be lost. If
 * it's true then a final poll cycle will occur immediately and synchronously.
 *
 * @method
 * @param {boolean} poll Poll one last time before stopping future polling
 */
ve.ce.SurfaceObserver.prototype.stop = function ( poll ) {
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
 * Poll for changes.
 *
 * If {async} is false or undefined then polling will occcur asynchronously.
 *
 * TODO: fixing selection in certain cases, handling selection across multiple nodes in Firefox
 *
 * @method
 * @param {boolean} async Poll asynchronously
 */
ve.ce.SurfaceObserver.prototype.poll = function ( async ) {
	var delayPoll, rangySelection, $branch, node, text, hash, range;

	if ( this.timeoutId !== null ) {
		clearTimeout( this.timeoutId );
		this.timeoutId = null;
	}

	delayPoll = ve.bind( function ( async ) {
		this.timeoutId = setTimeout(
			ve.bind( this.poll, this ),
			async === true ? 0 : this.frequency
		);
	}, this );

	if ( async === true ) {
		delayPoll( true );
		return;
	}

	range = this.range;
	rangySelection = rangy.getSelection();
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

		$branch = $( rangySelection.anchorNode ).closest( '.ve-ce-branchNode' );
		if ( $branch.length ) {
			node = $branch.data( 'node' );
			if ( node.canHaveGrandchildren() ) {
				node = null;
			} else {
				range = new ve.Range(
					ve.ce.getOffset( rangySelection.anchorNode, rangySelection.anchorOffset ),
					ve.ce.getOffset( rangySelection.focusNode, rangySelection.focusOffset )
				);
			}
		}
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

	// Only emit selectionChange event if there's a meaningful range difference
	if ( ( this.range && range ) ? !this.range.equals( range ) : ( this.range !== range ) ) {
		this.emit(
			'selectionChange',
			this.range,
			range
		);
		this.range = range;
	}

	delayPoll();
};
