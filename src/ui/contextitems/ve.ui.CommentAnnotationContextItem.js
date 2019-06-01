/*!
 * VisualEditor CommentAnnotationContextItem class.
 *
 * @copyright 2011-2019 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Context item for a comment.
 *
 * @class
 * @extends ve.ui.AnnotationContextItem
 *
 * @param {ve.ui.Context} context Context item is in
 * @param {ve.dm.Model} model Model item is related to
 * @param {Object} config Configuration options
 */
ve.ui.CommentAnnotationContextItem = function VeUiCommentAnnotationContextItem( context, model, config ) {
	// Parent constructor
	ve.ui.CommentAnnotationContextItem.super.call( this, context, model, config );

	// Initialization
	this.$element.addClass( 've-ui-commentAnnotationContextItem' );
};

/* Inheritance */

OO.inheritClass( ve.ui.CommentAnnotationContextItem, ve.ui.AnnotationContextItem );

/* Static Properties */

ve.ui.CommentAnnotationContextItem.static.name = 'commentAnnotation';

ve.ui.CommentAnnotationContextItem.static.icon = 'speechBubble';

ve.ui.CommentAnnotationContextItem.static.label = OO.ui.deferMsg( 'visualeditor-commentinspector-title' );

ve.ui.CommentAnnotationContextItem.static.modelClasses = [ ve.dm.CommentAnnotation ];

ve.ui.CommentAnnotationContextItem.static.embeddable = false;

ve.ui.CommentAnnotationContextItem.static.commandName = 'commentAnnotation';

ve.ui.CommentAnnotationContextItem.static.clearable = true;

ve.ui.CommentAnnotationContextItem.static.clearIcon = 'trash';

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.CommentAnnotationContextItem.prototype.getDescription = function () {
	return this.model.getAttribute( 'text' ).trim();
};

/**
 * @inheritdoc
 */
ve.ui.CommentAnnotationContextItem.prototype.renderBody = function () {
	this.$body.append(
		this.getDescription().split( '\n' ).map( function ( line ) {
			return $( '<div>' ).text( line );
		} )
	);
};

/* Registration */

ve.ui.contextItemFactory.register( ve.ui.CommentAnnotationContextItem );
