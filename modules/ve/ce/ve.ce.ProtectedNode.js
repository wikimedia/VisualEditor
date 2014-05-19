/*!
 * VisualEditor ContentEditable ProtectedNode class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable protected node.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {jQuery} [$phantomable=this.$element] Element to show a phantom for
 */
ve.ce.ProtectedNode = function VeCeProtectedNode( $phantomable ) {
	// Properties
	this.$phantoms = this.$( [] );
	this.$shields = this.$( [] );
	this.$phantomable = $phantomable || this.$element;
	this.isSetup = false;
	this.isShielded = false;

	// Events
	this.connect( this, {
		'setup': 'onProtectedSetup',
		'teardown': 'onProtectedTeardown',
		'resizeStart': 'onProtectedResizeStart',
		'focus': 'onProtectedFocus',
		'rerender': 'positionPhantoms'
	} );
};

/* Static Properties */

ve.ce.ProtectedNode.static = {};

/* Methods */

/**
 * Create a shield element.
 *
 * Uses data URI to inject a 1x1 transparent GIF image into the DOM.
 *
 * @returns {jQuery} A shield element
 */
ve.ce.ProtectedNode.prototype.createShield = function () {
	return this.$( '<img>' )
		.addClass( 've-ce-protectedNode-shield' )
		.attr( 'src', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' );
};

/**
 * Create a phantom element.
 *
 * @returns {jQuery} A phantom element
 */
ve.ce.ProtectedNode.prototype.createPhantom = function () {
	return this.$( '<div>' )
		.addClass( 've-ce-protectedNode-phantom' )
		.attr( 'draggable', false );
};

/**
 * Handle setup events.
 *
 * @method
 */
ve.ce.ProtectedNode.prototype.onProtectedSetup = function () {
	// Exit if already setup or not unattached
	if ( this.isSetup || !this.root ) {
		return;
	}

	// DOM changes
	this.$element
		.addClass( 've-ce-protectedNode' )
		.prop( 'contentEditable', 'false' );

	// Events
	this.$element.on( {
		'mouseenter.ve-ce-protectedNode': ve.bind( this.onProtectedMouseEnter, this ),
		'mousedown.ve-ce-protectedNode': ve.bind( this.onProtectedMouseDown, this )
	} );
};

/**
 * Attach phantoms to the node.
 *
 * @method
 */
ve.ce.ProtectedNode.prototype.attachPhantoms = function () {
	var $shield,
		node = this;

	// Events
	this.getRoot().getSurface().getSurface()
		.connect( this, { 'position': 'positionPhantoms' } );

	// Shields
	this.$element.add( this.$element.find( '*' ) ).each( function () {
		if ( this.nodeType === Node.ELEMENT_NODE ) {
			var cssFloat, $this = node.$( this );
			if (
				// Always shield the root
				!$this.hasClass( 've-ce-protectedNode' ) &&
				// Phantoms are built off shields, so make sure $phantomable has a shield
				!$this.is( node.$phantomable )
			) {
				// .css( 'float' ) is *very* expensive so compute at
				// last possible opportunity
				cssFloat = $this.css( 'float' );
				if ( cssFloat === 'none' || cssFloat === '' ) {
					return;
				}
			}
			$shield = node.createShield()
				.appendTo( $this )
				.on( 'dblclick', function () {
					node.emit( 'dblclick' );
				} );
			node.$shields = node.$shields.add( $shield );
			$this.addClass( 've-ce-protectedNode-shielded' );
		}
	} );

	this.isShielded = true;
};

/**
 * Handle teardown events.
 *
 * @method
 */
ve.ce.ProtectedNode.prototype.onProtectedTeardown = function () {
	// Exit if not setup or not attached
	if ( !this.isSetup || !this.root ) {
		return;
	}

	// Events
	this.$element.off( '.ve-ce-protectedNode' );
	this.getRoot().getSurface().getSurface()
		.disconnect( this, { 'position': 'positionPhantoms' } );

	// Shields
	this.$shields.remove();
	this.$shields = this.$( [] );
	this.$element.add( this.$element.find( '.ve-ce-protectedNode-shielded' ) )
		.removeClass( 've-ce-protectedNode-shielded' );

	// Phantoms
	this.clearPhantoms();

	// DOM changes
	this.$element
		.removeClass( 've-ce-protectedNode' )
		.removeProp( 'contentEditable' );

	this.isSetup = false;
	this.isShielded = false;
};

/**
 * Handle phantom mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse down event
 */
ve.ce.ProtectedNode.prototype.onPhantomMouseDown = function ( e ) {
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

	e.preventDefault();
};

/**
 * Handle mouse enter events.
 *
 * @method
 * @param {jQuery.Event} e Mouse enter event
 */
ve.ce.ProtectedNode.prototype.onProtectedMouseEnter = function () {
	if ( !this.isShielded ) {
		this.attachPhantoms();
	}
	if ( !this.root.getSurface().dragging && !this.root.getSurface().resizing ) {
		this.createPhantoms();
	}
};

/**
 * Handle mouse down events.
 *
 * @method
 * @param {jQuery.Event} e Mouse enter event
 */
ve.ce.ProtectedNode.prototype.onProtectedMouseDown = function ( e ) {
	// Abort mousedown events otherwise the surface will go into
	// dragging mode on touch devices
	e.stopPropagation();
};

/**
 * Handle surface mouse move events.
 *
 * @method
 * @param {jQuery.Event} e Mouse move event
 */
ve.ce.ProtectedNode.prototype.onSurfaceMouseMove = function ( e ) {
	var $target = this.$( e.target );
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
 * Handle resize start events.
 *
 * @method
 */
ve.ce.ProtectedNode.prototype.onProtectedResizeStart = function () {
	this.clearPhantoms();
};

/**
 * Handle focus events.
 *
 * @method
 */
ve.ce.ProtectedNode.prototype.onProtectedFocus = function () {
	if ( !this.isShielded ) {
		this.attachPhantoms();
	}
};

/**
 * Creates phantoms
 *
 * @method
 */
ve.ce.ProtectedNode.prototype.createPhantoms = function () {
	var surface = this.root.getSurface(),
		node = this;

	if ( !this.isShielded ) {
		this.attachPhantoms();
	}

	this.$phantomable.find( '.ve-ce-protectedNode-shield:visible' ).each(
		ve.bind( function () {
			this.$phantoms = this.$phantoms.add(
				this.createPhantom()
					.on( 'mousedown', ve.bind( this.onPhantomMouseDown, this ) )
					.on( 'dblclick', function () {
						node.emit( 'dblclick' );
					} )
			);
		}, this )
	);
	this.positionPhantoms();
	surface.replacePhantoms( this.$phantoms );

	surface.$element.on( {
		'mousemove.ve-ce-protectedNode': ve.bind( this.onSurfaceMouseMove, this ),
		'mouseout.ve-ce-protectedNode': ve.bind( this.onSurfaceMouseOut, this )
	} );
	surface.getModel().getDocument().connect( this, { 'transact': 'positionPhantoms' } );
};

/**
 * Positions phantoms
 *
 * @method
 */
ve.ce.ProtectedNode.prototype.positionPhantoms = function () {
	this.$phantomable.find( '.ve-ce-protectedNode-shield:visible' ).each(
		ve.bind( function ( i, element ) {
			var $shield = this.$( element ),
				offset = OO.ui.Element.getRelativePosition(
					$shield, this.getRoot().getSurface().getSurface().$element
				);
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
	surface.$element.unbind( '.ve-ce-protectedNode' );
	surface.getModel().getDocument().disconnect( this, { 'transact': 'positionPhantoms' } );
	this.$phantoms = this.$( [] );
};
