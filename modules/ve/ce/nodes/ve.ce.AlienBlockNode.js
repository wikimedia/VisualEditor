/**
 * VisualEditor content editable AlienBlockNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable node for an alien block node.
 *
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param {ve.dm.AlienBlockNode} model Model to observe.
 */
ve.ce.AlienBlockNode = function VeCeAlienBlockNode( model ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, 'alienBlock', model );

	// DOM Changes
	this.$.addClass( 've-ce-alienBlockNode' );
	this.$.attr( 'contenteditable', false );

	// Events
	this.model.addListenerMethod( this, 'update', 'onUpdate' );
	this.$.on( 'mouseenter', ve.bind( this.onMouseEnter, this ) );

	// Initialization
	this.onUpdate();
};

/* Inheritance */

ve.inheritClass( ve.ce.AlienBlockNode, ve.ce.LeafNode );

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.AlienBlockNode.rules = {
	'canBeSplit': false
};

/* Methods */

ve.ce.AlienBlockNode.prototype.onUpdate = function () {
	var $shieldTemplate = this.constructor.static.$shieldTemplate;
	this.$.html( this.model.getAttribute( 'html' ) );
	this.$.add( this.$.find( '*' ) ).each( function () {
		var $this = $( this );
		if ( this.nodeType === Node.ELEMENT_NODE ) {
			if (
				( $this.css( 'float' ) === 'none' || $this.css( 'float' ) === '' ) &&
				!$this.hasClass( 've-ce-alienBlockNode' )
			) {
				return;
			}
			$this.append( $shieldTemplate.clone() );
		}
	} );
};

ve.ce.AlienBlockNode.prototype.onMouseEnter = function () {
	var	$phantoms = $( [] ),
		$phantomTemplate = ve.ce.Surface.static.$phantomTemplate;
	this.$.find( '.ve-ce-node-shield' ).each( function () {
		var	$shield = $( this ),
			offset = $shield.offset();
		$phantoms = $phantoms.add(
			$phantomTemplate.clone().css( {
				'top': offset.top,
				'left': offset.left,
				'height': $shield.height(),
				'width': $shield.width(),
				'background-position': -offset.left + 'px ' + -offset.top + 'px'
			} )
		);
	} );
	this.root.getSurface().$phantoms.empty().append( $phantoms );
};

/* Registration */

ve.ce.nodeFactory.register( 'alienBlock', ve.ce.AlienBlockNode );
