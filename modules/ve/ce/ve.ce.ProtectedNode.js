/*!
 * VisualEditor ContentEditable ProtectedNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable relocatable node.
 *
 * @class
 * @abstract
 *
 * @constructor
 */
ve.ce.ProtectedNode = function VeCeProtectedNode() {
	// Properties
	this.$phantoms = $( [] );
	this.$shields = $( [] );

	// Events
	this.connect( this, {
		'setup': 'onProtectedSetup',
		'teardown': 'onProtectedTeardown'
	} );

	// Initialization
	this.$.addClass( 've-ce-protectedNode' );
};

/* Static Properties */

ve.ce.ProtectedNode.static = {};

/**
 * Template for shield elements.
 *
 * Uses data URI to inject a 1x1 transparent GIF image into the DOM.
 *
 * @property {jQuery}
 * @static
 * @inheritable
 */
ve.ce.ProtectedNode.static.$shieldTemplate = $( '<img>' )
	.addClass( 've-ce-protectedNode-shield' )
	.attr( 'src', 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' );

/**
 * Phantom element template.
 *
 * @property {jQuery}
 * @static
 * @inheritable
 */
ve.ce.ProtectedNode.static.$phantomTemplate = $( '<div>' )
	.addClass( 've-ce-protectedNode-phantom' )
	.attr( 'draggable', false );

/* Methods */

/**
 * Handle setup events.
 *
 * @method
 */
ve.ce.ProtectedNode.prototype.onProtectedSetup = function () {
	var $shield,
		node = this,
		$shieldTemplate = this.constructor.static.$shieldTemplate,
		surfaceModel = this.getRoot().getSurface().getModel();

	// Events
	this.$.on( 'mouseenter.ve-ce-protectedNode', ve.bind( this.onProtectedMouseEnter, this ) );
	surfaceModel.connect( this, { 'change': 'onSurfaceModelChange' } );

	// Shields
	this.$.add( this.$.find( '*' ) ).each( function () {
		var $this = $( this );
		if ( this.nodeType === Node.ELEMENT_NODE ) {
			if (
				( $this.css( 'float' ) === 'none' || $this.css( 'float' ) === '' ) &&
				!$this.hasClass( 've-ce-protectedNode' )
			) {
				return;
			}
			$shield = $shieldTemplate.clone().appendTo( $this );
			node.$shields = node.$shields.add( $shield );
		}
	} );

};

/**
 * Handle teardown events.
 *
 * @method
 */
ve.ce.ProtectedNode.prototype.onProtectedTeardown = function () {
	var surfaceModel = this.getRoot().getSurface().getModel();

	// Events
	this.$.off( '.ve-ce-protectedNode' );
	surfaceModel.disconnect( this, { 'change': 'onSurfaceModelChange' } );

	// Shields
	this.$shields.remove();
	this.$shields = $( [] );

	// Phantoms
	this.clearPhantoms();
};

/**
 * Handle phantom click events.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
ve.ce.ProtectedNode.prototype.onPhantomClick = function ( e ) {
	var surfaceModel = this.getRoot().getSurface().getModel(),
		selectionRange = surfaceModel.getSelection(),
		nodeRange = this.model.getOuterRange();

	surfaceModel.getFragment(
		e.shiftKey ?
			ve.Range.newCoveringRange(
				[ selectionRange, nodeRange ], selectionRange.from > nodeRange.from
			) :
			nodeRange
	).select();
};

/**
 * Handle mouse enter events.
 *
 * @method
 */
ve.ce.ProtectedNode.prototype.onProtectedMouseEnter = function () {
	if ( !this.root.getSurface().dragging ) {
		this.createPhantoms();
	}
};

/**
 * Handle surface mouse move events.
 *
 * @method
 * @param {jQuery.Event} e Mouse move event
 */
ve.ce.ProtectedNode.prototype.onSurfaceMouseMove = function ( e ) {
	var $target = $( e.target );
	if (
		!$target.hasClass( 've-ce-protectedNode-phantom' ) &&
		$target.closest( '.ve-ce-protectedNode' ).length === 0
	) {
		this.clearPhantoms();
	}
};

/**
 * Handle surface mouse out events.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.ce.ProtectedNode.prototype.onSurfaceMouseOut = function ( e ) {
	if ( e.toElement === null ) {
		this.clearPhantoms();
	}
};

/**
 * Handle surface model change events
 *
 * @method
 */
ve.ce.ProtectedNode.prototype.onSurfaceModelChange = function () {
	if ( this.$phantoms.length ) {
		this.positionPhantoms();
	}
};

/**
 * Creates phantoms
 *
 * @method
 */
ve.ce.ProtectedNode.prototype.createPhantoms = function () {
	var $phantomTemplate = this.constructor.static.$phantomTemplate,
		surface = this.root.getSurface();

	this.$.find( '.ve-ce-protectedNode-shield' ).each(
		ve.bind( function () {
			this.$phantoms = this.$phantoms.add(
				$phantomTemplate.clone().on( 'click', ve.bind( this.onPhantomClick, this ) )
			);
		}, this )
	);
	this.positionPhantoms();
	surface.replacePhantoms( this.$phantoms );

	surface.$.on( {
		'mousemove.ve-ce-protectedNode': ve.bind( this.onSurfaceMouseMove, this ),
		'mouseout.ve-ce-protectedNode': ve.bind( this.onSurfaceMouseOut, this )
	} );
};

/**
 * Positions phantoms
 *
 * @method
 */
ve.ce.ProtectedNode.prototype.positionPhantoms = function () {
	this.$.find( '.ve-ce-protectedNode-shield' ).each(
		ve.bind( function ( i, element ) {
			var $shield = $( element ),
				offset = $shield.offset();
			this.$phantoms.eq( i ).css( {
				'top': offset.top,
				'left': offset.left,
				'height': $shield.height(),
				'width': $shield.width(),
				'background-position': -offset.left + 'px ' + -offset.top + 'px'
			} );
		}, this )
	);
};

/**
 * Clears all phantoms and unbinds .ve-ce-protectedNode namespace event handlers
 *
 * @method
 */
ve.ce.ProtectedNode.prototype.clearPhantoms = function () {
	var surface = this.root.getSurface();
	surface.replacePhantoms( null );
	surface.$.unbind( '.ve-ce-protectedNode' );
	this.$phantoms = $( [] );
};
