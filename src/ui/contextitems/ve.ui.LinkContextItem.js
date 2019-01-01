/*!
 * VisualEditor LinkContextItem class.
 *
 * @copyright 2011-2019 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Context item for a link.
 *
 * @class
 * @extends ve.ui.AnnotationContextItem
 *
 * @param {ve.ui.Context} context Context item is in
 * @param {ve.dm.Model} model Model item is related to
 * @param {Object} config Configuration options
 */
ve.ui.LinkContextItem = function VeUiLinkContextItem( context, model, config ) {
	// Parent constructor
	ve.ui.LinkContextItem.super.call( this, context, model, config );

	// Initialization
	this.$element.addClass( 've-ui-linkContextItem' );

	this.labelPreview = new OO.ui.LabelWidget();
	this.labelButton = new OO.ui.ButtonWidget( {
		label: OO.ui.deferMsg( 'visualeditor-linkcontext-label-change' ),
		framed: false,
		flags: [ 'progressive' ]
	} ).connect( this, { click: 'onLabelButtonClick' } );

	this.$labelLayout = $( '<div>' ).addClass( 've-ui-linkContextItem-label' ).append(
		$( '<div>' ).addClass( 've-ui-linkContextItem-label-label' ).append(
			new OO.ui.IconWidget( { icon: 'quotes' } ).$element,
			new OO.ui.LabelWidget( { label: OO.ui.deferMsg( 'visualeditor-linkcontext-label-label' ) } ).$element
		),
		$( '<div>' ).addClass( 've-ui-linkContextItem-label-preview' ).append( this.labelPreview.$element ),
		$( '<div>' ).addClass( 've-ui-linkContextItem-label-action' ).append( this.labelButton.$element )
	);
};

/* Inheritance */

OO.inheritClass( ve.ui.LinkContextItem, ve.ui.AnnotationContextItem );

/* Static Properties */

ve.ui.LinkContextItem.static.name = 'link';

ve.ui.LinkContextItem.static.icon = 'link';

ve.ui.LinkContextItem.static.label = OO.ui.deferMsg( 'visualeditor-linkinspector-title' );

ve.ui.LinkContextItem.static.modelClasses = [ ve.dm.LinkAnnotation ];

ve.ui.LinkContextItem.static.embeddable = false;

ve.ui.LinkContextItem.static.commandName = 'link';

ve.ui.LinkContextItem.static.clearable = true;

ve.ui.LinkContextItem.static.clearMsg = OO.ui.deferMsg( 'visualeditor-linkcontext-remove' );

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.LinkContextItem.prototype.getDescription = function () {
	return this.model.getHref();
};

/**
 * @inheritdoc
 */
ve.ui.LinkContextItem.prototype.renderBody = function () {
	var htmlDoc = this.context.getSurface().getModel().getDocument().getHtmlDocument();
	this.$body.empty().append(
		$( '<a>' )
			.text( this.getDescription() )
			.attr( {
				href: ve.resolveUrl( this.model.getHref(), htmlDoc ),
				target: '_blank',
				rel: 'noopener'
			} ),
		this.$labelLayout
	);
	this.updateLabelPreview();
};

/**
 * Set the preview of the label
 *
 * @protected
 */
ve.ui.LinkContextItem.prototype.updateLabelPreview = function () {
	var annotationView = this.getAnnotationView(),
		label = annotationView && annotationView.$element[ 0 ].innerText.trim();
	this.labelPreview.setLabel( label || ve.msg( 'visualeditor-linkcontext-label-fallback' ) );
};

/**
 * Handle label-edit button click events.
 *
 * @localdoc Selects the contents of the link annotation
 *
 * @protected
 */
ve.ui.LinkContextItem.prototype.onLabelButtonClick = function () {
	var surface = this.context.getSurface().getView(),
		annotationView = this.getAnnotationView();
	surface.selectNodeContents( annotationView.$element[ 0 ] );
};

/* Registration */

ve.ui.contextItemFactory.register( ve.ui.LinkContextItem );
