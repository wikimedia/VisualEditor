/*!
 * VisualEditor Mobile Context Item widget class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Mobile version of context item widget
 *
 * @class
 * @extends ve.ui.ContextItemWidget
 *
 * @constructor
 * @param {Object} data
 * @param {Function} tool
 * @param {ve.dm.Node|ve.dm.Annotation} model
 * @param {Object} [config]
 */
ve.ui.MobileContextItemWidget = function VeUiContextItemWidget() {
	// Parent constructor
	ve.ui.MobileContextItemWidget.super.apply( this, arguments );

	this.$element.addClass( 've-ui-mobileContextItemWidget' );
	this.setLabel(
		this.$( '<span>' ).addClass( 've-ui-mobileContextItemWidget-label-secondary' )
			.text( ve.msg( 'visualeditor-contextitemwidget-label-secondary' ) )
			.add(
				this.$( '<span>' ).addClass( 've-ui-mobileContextItemWidget-label-primary' )
					.text( this.getDescription() )
			)
	);
};

/* Setup */

OO.inheritClass( ve.ui.MobileContextItemWidget, ve.ui.ContextItemWidget );
