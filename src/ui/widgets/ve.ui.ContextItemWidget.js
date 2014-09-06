/*!
 * VisualEditor Context Item widget class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Proxy for a tool, displaying information about the current context.
 *
 * Use with ve.ui.ContextMenuWidget.
 *
 * @class
 * @extends OO.ui.DecoratedOptionWidget
 *
 * @constructor
 * @param {Object} data Item data
 * @param {Function} tool Tool item is a proxy for
 * @param {ve.dm.Node|ve.dm.Annotation} model Node or annotation item is related to
 * @param {Object} [config] Configuration options
 */
ve.ui.ContextItemWidget = function VeUiContextItemWidget( data, tool, model, config ) {
	var $label;

	// Config intialization
	config = config || {};

	// Parent constructor
	ve.ui.ContextItemWidget.super.call( this, data, config );

	// Properties
	this.tool = tool;
	this.model = model;

	// Initialization
	this.$element.addClass( 've-ui-contextItemWidget' );
	this.setIcon( this.tool.static.icon );

	// FIXME: A hacky way to provide a secondary label/description.
	// This should be implemented in OOUI if we end up using it in more places.
	$label = $( '<span>' )
		.append( this.getDescription() )
		.append(
			$( '<span class="ve-ui-contextItemWidget-label-secondary">' )
				.text( ve.msg( 'visualeditor-contextitemwidget-label-secondary' ) )
		);
	this.setLabel( $label );
};

/* Setup */

OO.inheritClass( ve.ui.ContextItemWidget, OO.ui.DecoratedOptionWidget );

/* Methods */

/**
 * Get a description of the model.
 *
 * @return {string} Description of model
 */
ve.ui.ContextItemWidget.prototype.getDescription = function () {
	var description;

	if ( this.model instanceof ve.dm.Annotation ) {
		description = ve.ce.annotationFactory.getDescription( this.model );
	} else if ( this.model instanceof ve.dm.Node ) {
		description = ve.ce.nodeFactory.getDescription( this.model );
	}
	if ( !description ) {
		description = this.tool.static.title;
	}

	return description;
};

/**
 * Get the command for this item.
 *
 * @return {ve.ui.Command} Command
 */
ve.ui.ContextItemWidget.prototype.getCommand = function () {
	return ve.ui.commandRegistry.lookup( this.tool.static.commandName );
};
