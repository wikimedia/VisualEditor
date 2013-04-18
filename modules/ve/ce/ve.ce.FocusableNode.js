/*!
 * VisualEditor ContentEditable FocusableNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable resizable node.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {jQuery} [$resizable=this.$] Focusable DOM element
 */
ve.ce.FocusableNode = function VeCeFocusableNode() {
	// Properties
	this.focused = false;
};

/* Events */

/**
 * @event focus
 */

/**
 * @event blur
 */

/* Methods */

/**
 * Check if node is focused.
 *
 * @method
 * @returns {boolean} Node is focused
 */
ve.ce.FocusableNode.prototype.isFocused = function () {
	return this.focused;
};

/**
 * Set the selected state of the node.
 *
 * @method
 * @param {boolean} value Node is focused
 * @emits focus
 * @emits blur
 */
ve.ce.FocusableNode.prototype.setFocused = function ( value ) {
	value = !!value;
	if ( this.focused !== value ) {
		this.focused = value;
		if ( this.focused ) {
			this.emit( 'focus' );
			this.$.addClass( 've-ce-node-focused' );
		} else {
			this.emit( 'blur' );
			this.$.removeClass( 've-ce-node-focused' );
		}
	}
};
