/*!
 * VisualEditor ContentEditable AlienNode, AlienBlockNode and AlienInlineNode classes.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable alien node.
 *
 * @class
 * @abstract
 * @extends ve.ce.GeneratedContentNode
 * @constructor
 * @param {ve.dm.AlienNode} model Model to observe
 */
ve.ce.AlienNode = function VeCeAlienNode( model ) {
	// Parent constructor
	ve.ce.GeneratedContentNode.call( this, model );

	// DOM Changes
	this.$.addClass( 've-ce-alienNode' );

	// Properties
	this.$phantoms = $( [] );

	// Events
	this.connect( this, { 'live': 'onLive' } );
	this.$.on( 'mouseenter', ve.bind( this.onMouseEnter, this ) );
};

/* Inheritance */

ve.inheritClass( ve.ce.AlienNode, ve.ce.GeneratedContentNode );

/* Static Properties */

ve.ce.AlienNode.static.name = 'alien';

/* Methods */

/**
 * Handle live events.
 *
 * @method
 */
ve.ce.AlienNode.prototype.onLive = function () {
	var $shieldTemplate = this.constructor.static.$shieldTemplate,
		surfaceModel = this.getRoot().getSurface().getModel();

	if ( this.live === true ) {
		// Events
		surfaceModel.connect( this, { 'change': 'onSurfaceModelChange' } );

		// Shields
		this.$.add( this.$.find( '*' ) ).each( function () {
			var $this = $( this );
			if ( this.nodeType === Node.ELEMENT_NODE ) {
				if (
					( $this.css( 'float' ) === 'none' || $this.css( 'float' ) === '' ) &&
					!$this.hasClass( 've-ce-alienNode' )
				) {
					return;
				}
				$this.append( $shieldTemplate.clone() );
			}
		} );
	} else {
		surfaceModel.disconnect( this, { 'change': 'onSurfaceModelChange' } );
	}
};

/**
 * Handle update events.
 *
 * @method
 */
ve.ce.AlienNode.prototype.onUpdate = function () {
	this.$.html( ve.copyArray( this.model.getAttribute( 'domElements' ) || [] ) );
};

/**
 * Handle mouse enter events.
 *
 * @method
 */
ve.ce.AlienNode.prototype.onMouseEnter = function () {
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
ve.ce.AlienNode.prototype.onSurfaceMouseMove = function ( e ) {
	var $target = $( e.target );
	if (
		!$target.hasClass( 've-ce-surface-phantom' ) &&
		$target.closest( '.ve-ce-alienNode' ).length === 0
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
ve.ce.AlienNode.prototype.onSurfaceMouseOut = function ( e ) {
	if ( e.toElement === null ) {
		this.clearPhantoms();
	}
};

/**
 * Handle surface model change events
 *
 * @method
 */
ve.ce.AlienNode.prototype.onSurfaceModelChange = function () {
	if ( this.$phantoms.length ) {
		this.positionPhantoms();
	}
};

/**
 * Creates phantoms
 *
 * @method
 */
ve.ce.AlienNode.prototype.createPhantoms = function () {
	var $phantomTemplate = ve.ce.Surface.static.$phantomTemplate,
		surface = this.root.getSurface();

	this.$.find( '.ve-ce-node-shield' ).each(
		ve.bind( function () {
			this.$phantoms = this.$phantoms.add( $phantomTemplate.clone() );
		}, this )
	);
	this.positionPhantoms();
	surface.replacePhantoms( this.$phantoms );

	surface.$.on({
		'mousemove.phantoms': ve.bind( this.onSurfaceMouseMove, this ),
		'mouseout.phantoms': ve.bind( this.onSurfaceMouseOut, this )
	});
};

/**
 * Positions phantoms
 *
 * @method
 */
ve.ce.AlienNode.prototype.positionPhantoms = function () {
	this.$.find( '.ve-ce-node-shield' ).each(
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
 * Clears all phantoms and unbinds .phantoms namespace event handlers
 *
 * @method
 */
ve.ce.AlienNode.prototype.clearPhantoms = function() {
	var surface = this.root.getSurface();
	surface.replacePhantoms( null );
	surface.$.unbind( '.phantoms' );
	this.$phantoms = $( [] );
};

/* Concrete subclasses */

/**
 * ContentEditable alien block node.
 *
 * @class
 * @extends ve.ce.AlienNode
 * @constructor
 * @param {ve.dm.AlienBlockNode} model Model to observe
 */
ve.ce.AlienBlockNode = function VeCeAlienBlockNode( model ) {
	// Parent constructor
	ve.ce.AlienNode.call( this, model );

	// DOM Changes
	this.$.addClass( 've-ce-alienBlockNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.AlienBlockNode, ve.ce.AlienNode );

/* Static Properties */

ve.ce.AlienBlockNode.static.name = 'alienBlock';

/**
 * ContentEditable alien inline node.
 *
 * @class
 * @extends ve.ce.AlienNode
 * @constructor
 * @param {ve.dm.AlienInlineNode} model Model to observe
 */
ve.ce.AlienInlineNode = function VeCeAlienInlineNode( model ) {
	// Parent constructor
	ve.ce.AlienNode.call( this, model );

	// DOM Changes
	this.$.addClass( 've-ce-alienInlineNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.AlienInlineNode, ve.ce.AlienNode );

/* Static Properties */

ve.ce.AlienInlineNode.static.name = 'alienInline';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.AlienNode );
ve.ce.nodeFactory.register( ve.ce.AlienBlockNode );
ve.ce.nodeFactory.register( ve.ce.AlienInlineNode );
