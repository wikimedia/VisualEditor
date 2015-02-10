/*!
 * VisualEditor ContentEditable AlignableNode class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * ContentEditable Alignable node.
 *
 * @class
 * @abstract
 *
 * @constructor
 */
ve.ce.AlignableNode = function VeCeAlignableNode( $alignable, config ) {
	config = config || {};

	this.$alignable = $alignable || this.$element;

	// Events
	this.connect( this, { setup: 'onAlignableSetup' } );
	this.model.connect( this, { attributeChange: 'onAlignableAttributeChange' } );
};

/* Inheritance */

OO.initClass( ve.ce.AlignableNode );

/**
 * Handle attribute change events
 *
 * @param {string} key Key
 * @param {string} from Old value
 * @param {string} to New value
 */
ve.ce.AlignableNode.prototype.onAlignableAttributeChange = function ( key, from, to ) {
	var cssClasses;
	if ( key === 'align' ) {
		cssClasses = this.model.constructor.static.cssClasses;
		if ( from && cssClasses[from] ) {
			this.$alignable.removeClass( cssClasses[from] );
		}
		if ( to && cssClasses[to] ) {
			this.$alignable.addClass( cssClasses[to] );
		}
	}
};

/**
 * Handle node setup
 */
ve.ce.AlignableNode.prototype.onAlignableSetup = function () {
	var align = this.model.getAttribute( 'align' ),
		cssClasses = this.model.constructor.static.cssClasses;
	if ( align && cssClasses[align] ) {
		this.$alignable.addClass( cssClasses[align] );
	}
};
