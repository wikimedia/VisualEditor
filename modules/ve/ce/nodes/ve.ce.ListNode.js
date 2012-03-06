/**
 * Creates an ve.ce.ListNode object.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param {ve.dm.ListNode} model List model to view
 */
ve.ce.ListNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, model );

	// DOM Changes
	this.$.addClass( 'es-listView' );

	// Events
	var _this = this;
	this.model.on( 'update', function() {
		_this.enumerate();
	} );

	// Initialization
	this.enumerate();
};

/* Methods */

/**
 * Set the number labels of all ordered list items.
 * 
 * @method
 */
ve.ce.ListNode.prototype.enumerate = function() {
	var styles,
		levels = [];
	for ( var i = 0; i < this.children.length; i++ ) {
		styles = this.children[i].model.getElementAttribute( 'styles' );
		levels = levels.slice( 0, styles.length );
		if ( styles[styles.length - 1] === 'number' ) {
			if ( !levels[styles.length - 1] ) {
				levels[styles.length - 1] = 0;
			}
			this.children[i].$icon.text( ++levels[styles.length - 1] + '.' );
		} else {
			this.children[i].$icon.text( '' );
			if ( levels[styles.length - 1] ) {
				levels[styles.length - 1] = 0;
			}
		}
	}
};

/* Registration */

ve.ce.DocumentNode.splitRules.list = {
	'self': false,
	'children': true
};

/* Inheritance */

ve.extendClass( ve.ce.ListNode, ve.ce.BranchNode );
