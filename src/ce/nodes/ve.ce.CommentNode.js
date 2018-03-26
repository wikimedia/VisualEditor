/*!
 * VisualEditor ContentEditable CommentNode class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * ContentEditable comment node.
 *
 * @class
 * @extends ve.ce.LeafNode
 * @mixins ve.ce.FocusableNode
 *
 * @constructor
 * @param {ve.dm.CommentNode} model Model to observe
 * @param {Object} [config] Configuration options
 */
ve.ce.CommentNode = function VeCeCommentNode( model, config ) {
	// Parent constructor
	ve.ce.CommentNode.super.call( this, model, config );

	// Mixin constructors
	ve.ce.FocusableNode.call( this, this.$element, config );

	// Events
	this.model.connect( this, { attributeChange: 'onAttributeChange' } );

	// DOM changes
	this.$element.addClass( 've-ce-commentNode' );
};

/* Inheritance */

OO.inheritClass( ve.ce.CommentNode, ve.ce.LeafNode );
OO.mixinClass( ve.ce.CommentNode, ve.ce.FocusableNode );

/* Static Properties */

ve.ce.CommentNode.static.name = 'comment';

ve.ce.CommentNode.static.primaryCommandName = 'comment';

ve.ce.CommentNode.static.iconWhenInvisible = 'notice';

ve.ce.CommentNode.static.maxPreviewLength = 20;

/* Static Methods */

/**
 * @inheritdoc
 */
ve.ce.CommentNode.static.getDescription = function ( model ) {
	return model.getAttribute( 'text' );
};

/**
 * Create a preview-safe version of some text
 *
 * The text preview is a trimmed down version of the actual comment. This
 * means that we strip whitespace and newlines, and truncate to a
 * fairly short length. The goal is to provide a fair representation of
 * typical short comments, and enough context for long comments that the
 * user can tell whether they want to see the full view by focusing the
 * node / hovering.
 *
 * @param  {string} text
 * @return {string|OO.ui.HtmlSnippet}
 */
ve.ce.CommentNode.static.getTextPreview = function ( text ) {
	text = text.trim().replace( /\s+/, ' ' );
	if ( text.length > this.maxPreviewLength ) {
		text = new OO.ui.HtmlSnippet( ve.escapeHtml( ve.graphemeSafeSubstring( text, 0, this.maxPreviewLength ) ) + '&hellip;' );
	}
	return text;
};

/**
 * Update the rendering of the 'text' attribute
 * when it changes in the model.
 *
 * @method
 * @param {string} key Attribute key
 * @param {string} from Old value
 * @param {string} to New value
 */
ve.ce.CommentNode.prototype.onAttributeChange = function ( key, from, to ) {
	if ( key === 'text' && this.icon ) {
		this.icon.setLabel( this.constructor.static.getTextPreview( to ) );
	}
};

/* Methods */

/**
 * @inheritdoc
 */
ve.ce.CommentNode.prototype.createInvisibleIcon = function () {
	var icon;
	// Check the node hasn't been destroyed, as this method is
	// called after an rAF in ve.ce.FocusableNode
	if ( !this.getModel() ) {
		return;
	}
	icon = new OO.ui.ButtonWidget( {
		classes: [ 've-ce-focusableNode-invisibleIcon' ],
		framed: false,
		icon: this.constructor.static.iconWhenInvisible,
		// If the label is empty, it's most likely because we've just inserted
		// this; use a zero-width space for consistent rendering
		label: this.constructor.static.getTextPreview( this.getModel().getAttribute( 'text' ) ) || new OO.ui.HtmlSnippet( '&#8203;' )
	} );
	this.icon = icon;
	return icon.$element;
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.CommentNode );
