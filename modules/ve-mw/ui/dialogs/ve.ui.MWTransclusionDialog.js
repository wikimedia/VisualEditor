/*
 * VisualEditor user interface MWTransclusionDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Dialog for inserting and editing MediaWiki transclusions.
 *
 * @class
 * @extends ve.ui.MWDialog
 *
 * @constructor
 * @param {ve.ui.WindowSet} windowSet Window set this dialog is part of
 * @param {Object} [config] Configuration options
 */
ve.ui.MWTransclusionDialog = function VeUiMWTransclusionDialog( windowSet, config ) {
	// Parent constructor
	ve.ui.MWDialog.call( this, windowSet, config );

	// Properties
	this.node = null;
	this.transclusion = null;
	this.loaded = false;
};

/* Inheritance */

OO.inheritClass( ve.ui.MWTransclusionDialog, ve.ui.MWDialog );

/* Static Properties */

ve.ui.MWTransclusionDialog.static.icon = 'template';

/* Methods */

/**
 * Handle parts being replaced.
 *
 * @param {ve.dm.MWTransclusionPartModel} removed Removed part
 * @param {ve.dm.MWTransclusionPartModel} added Added part
 */
ve.ui.MWTransclusionDialog.prototype.onReplacePart = function ( removed, added ) {
	var i, len, page, name, names, params, selected,
		removePages = [],
		select = false;

	if ( removed ) {
		// Remove parameter pages of removed templates
		if ( removed instanceof ve.dm.MWTemplateModel ) {
			params = removed.getParameters();
			for ( name in params ) {
				removePages.push( this.bookletLayout.getPage( params[name].getId() ) );
			}
			removed.disconnect( this );
		}
		if ( this.outlined ) {
			// Auto-select new part if placeholder is still selected
			selected = this.bookletLayout.getOutline().getSelectedItem();
			if ( selected && removed.getId() === selected.getData() ) {
				select = true;
			}
		}
		removePages.push( this.bookletLayout.getPage( removed.getId() ) );
		this.bookletLayout.removePages( removePages );
	}

	if ( added ) {
		if ( added instanceof ve.dm.MWTemplateModel ) {
			page = new ve.ui.MWTemplatePage( added, added.getId(), { '$': this.$ } );
		} else if ( added instanceof ve.dm.MWTransclusionContentModel ) {
			page = new ve.ui.MWTransclusionContentPage( added, added.getId(), { '$': this.$ } );
		} else if ( added instanceof ve.dm.MWTemplatePlaceholderModel ) {
			page = new ve.ui.MWTemplatePlaceholderPage( added, added.getId(), { '$': this.$ } );
		}
		if ( page ) {
			this.bookletLayout.addPages( [ page ], this.transclusion.getIndex( added ) );
			if ( select && this.loaded ) {
				this.setPageByName( added.getId() );
			}
			// Add existing params to templates (the template might be being moved)
			if ( added instanceof ve.dm.MWTemplateModel ) {
				names = added.getParameterNames();
				params = added.getParameters();
				for ( i = 0, len = names.length; i < len; i++ ) {
					this.onAddParameter( params[names[i]] );
				}
				added.connect( this, { 'add': 'onAddParameter', 'remove': 'onRemoveParameter' } );
			}

			// Add required params to user created templates
			if ( added instanceof ve.dm.MWTemplateModel && this.loaded ) {
				added.addRequiredParameters();
			}
		}
	}
};

/**
 * Handle add param events.
 *
 * @param {ve.dm.MWTemplateParameterModel} param Added param
 */
ve.ui.MWTransclusionDialog.prototype.onAddParameter = function ( param ) {
	var page = new ve.ui.MWTemplateParameterPage( param, param.getId(), { '$': this.$ } );
	this.bookletLayout.addPages( [ page ], this.transclusion.getIndex( param ) );
	if ( this.loaded ) {
		this.setPageByName( param.getId() );
	}
};

/**
 * Handle remove param events.
 *
 * @param {ve.dm.MWTemplateParameterModel} param Removed param
 */
ve.ui.MWTransclusionDialog.prototype.onRemoveParameter = function ( param ) {
	this.bookletLayout.removePages( [ this.bookletLayout.getPage( param.getId() ) ] );
	if ( this.loaded ) {
		// Return to template page
		this.setPageByName( param.getTemplate().getId() );
	}
};

/**
 * Get an outlined booklet layout widget.
 *
 * @return {OO.ui.BookletLayout} Configured widget
 */
ve.ui.MWTransclusionDialog.prototype.getBookletLayout = function () {
	return new OO.ui.BookletLayout( { '$': this.$, 'continuous': true } );
};

/**
 * Set the page by name.
 *
 * Page names are always the ID of the part or param they represent.
 *
 * @param {string} name Page name
 */
ve.ui.MWTransclusionDialog.prototype.setPageByName = function ( name ) {
	if ( this.outlined ) {
		this.bookletLayout.getOutline().selectItem(
			this.bookletLayout.getOutline().getItemFromData( name )
		);
	} else {
		this.bookletLayout.setPage( name );
	}
};

/**
 * @inheritdoc
 */
ve.ui.MWTransclusionDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.MWDialog.prototype.initialize.call( this );

	// Properties
	this.applyButton = new OO.ui.PushButtonWidget( {
		'$': this.$,
		'label': ve.msg( 'visualeditor-dialog-action-apply' ),
		'flags': ['primary']
	} );
	this.bookletLayout = this.getBookletLayout();

	// Events
	this.applyButton.connect( this, { 'click': [ 'close', { 'action': 'apply' } ] } );

	// Initialization
	this.$body.append( this.bookletLayout.$element );
	this.$foot.append( this.applyButton.$element );
};

/**
 * @inheritdoc
 */
ve.ui.MWTransclusionDialog.prototype.setup = function ( data ) {
	// Parent method
	ve.ui.MWDialog.prototype.setup.call( this, data );

	// Sanity check
	this.node = this.surface.getView().getFocusedNode();

	// Properties
	this.transclusion = new ve.dm.MWTransclusionModel();
	this.loaded = false;

	// Events
	this.transclusion.connect( this, { 'replace': 'onReplacePart' } );

	// Initialization
	if ( this.node instanceof ve.ce.MWTransclusionNode ) {
		this.transclusion
			.load( ve.copy( this.node.getModel().getAttribute( 'mw' ) ) )
				.always( ve.bind( function () {
					this.loaded = true;
				}, this ) );
	} else {
		this.loaded = true;
		this.transclusion.addPart( new ve.dm.MWTemplatePlaceholderModel( this.transclusion ) );
	}
};

/**
 * @inheritdoc
 */
ve.ui.MWTransclusionDialog.prototype.teardown = function ( data ) {
	var surfaceModel = this.surface.getModel(),
		obj = this.transclusion.getPlainObject();

	// Data initialization
	data = data || {};

	// Save changes
	if ( data.action === 'apply' ) {
		if ( this.node instanceof ve.ce.MWTransclusionNode ) {
			if ( obj !== null ) {
				surfaceModel.getFragment().changeAttributes( { 'mw': obj } );
			} else {
				surfaceModel.getFragment().removeContent();
			}
		} else if ( obj !== null ) {
			surfaceModel.getFragment().collapseRangeToEnd().insertContent( [
				{
					'type': 'mwTransclusionInline',
					'attributes': {
						'mw': obj
					}
				},
				{ 'type': '/mwTransclusionInline' }
			] );
		}
	}

	this.transclusion.disconnect( this );
	this.transclusion.abortRequests();
	this.transclusion = null;
	this.bookletLayout.clearPages();
	this.node = null;
	this.content = null;

	// Parent method
	ve.ui.MWDialog.prototype.teardown.call( this, data );
};
