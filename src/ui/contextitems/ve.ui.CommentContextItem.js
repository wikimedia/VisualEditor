/*!
 * VisualEditor CommentContextItem class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Context item for a comment.
 *
 * @extends ve.ui.ContextItem
 *
 * @param {ve.ui.Context} context Context item is in
 * @param {ve.dm.Model} model Model item is related to
 * @param {Object} config Configuration options
 */
ve.ui.CommentContextItem = function VeCommentContextItem( context, model, config ) {
	// Parent constructor
	ve.ui.CommentContextItem.super.call( this, context, model, config );

	// Initialization
	this.$element.addClass( 've-ui-commentContextItem' );
};

/* Inheritance */

OO.inheritClass( ve.ui.CommentContextItem, ve.ui.ContextItem );

/* Static Properties */

ve.ui.CommentContextItem.static.name = 'comment';

ve.ui.CommentContextItem.static.icon = 'comment';

ve.ui.CommentContextItem.static.label = OO.ui.deferMsg( 'visualeditor-commentinspector-title' );

ve.ui.CommentContextItem.static.modelClasses = [ ve.dm.CommentNode ];

ve.ui.CommentContextItem.static.embeddable = false;

ve.ui.CommentContextItem.static.commandName = 'comment';

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.CommentContextItem.prototype.getDescription = function () {
	return this.model.getAttribute( 'text' ).trim();
};

/* Registration */

ve.ui.contextItemFactory.register( ve.ui.CommentContextItem );
