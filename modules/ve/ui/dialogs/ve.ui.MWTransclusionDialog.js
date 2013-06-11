/*!
 * VisualEditor user interface MWTransclusionDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Document dialog.
 *
 * See https://raw.github.com/wikimedia/mediawiki-extensions-TemplateData/master/spec.templatedata.json
 * for the latest version of the TemplateData specification.
 *
 * @class
 * @extends ve.ui.PagedDialog
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Config options
 */
ve.ui.MWTransclusionDialog = function VeUiMWTransclusionDialog( surface, config ) {
	// Parent constructor
	ve.ui.PagedDialog.call( this, surface, config );

	// Properties
	this.node = null;
	this.transclusion = null;
};

/* Inheritance */

ve.inheritClass( ve.ui.MWTransclusionDialog, ve.ui.PagedDialog );

/* Static Properties */

ve.ui.MWTransclusionDialog.static.titleMessage = 'visualeditor-dialog-transclusion-title';

ve.ui.MWTransclusionDialog.static.icon = 'template';

ve.ui.MWTransclusionDialog.static.modelClasses = [ ve.dm.MWTransclusionNode ];

/* Methods */

/**
 * Handle frame open events.
 *
 * @method
 * @throws {Error} If the surface doesn't have a focused node
 * @throws {Error} If the focused node is not a transclusion
 */
ve.ui.MWTransclusionDialog.prototype.onOpen = function () {
	// Parent method
	ve.ui.PagedDialog.prototype.onOpen.call( this );

	// Sanity check
	this.node = this.surface.getView().getFocusedNode();
	if ( !this.node ) {
		throw new Error( 'Surface does not have a focused node' );
	}
	if ( !( this.node instanceof ve.ce.MWTransclusionNode ) ) {
		throw new Error( 'Focused node is not a transclusion' );
	}

	// Properties
	this.transclusion = new ve.dm.MWTransclusionModel();

	// Initialization
	this.transclusion.load( ve.copyObject( this.node.getModel().getAttribute( 'mw' ) ) )
		.always( ve.bind( this.setupPages, this ) );
};

/**
 * Handle window close events.
 *
 * @param {string} action Action that caused the window to be closed
 */
ve.ui.MWTransclusionDialog.prototype.onClose = function ( action ) {
	var surfaceModel = this.surface.getModel();

	// Save changes
	if ( action === 'apply' ) {

		// TODO: Wrap attribute changes in ve.dm.SurfaceFragment
		surfaceModel.change(
			ve.dm.Transaction.newFromAttributeChange(
				surfaceModel.getDocument(),
				this.node.getOffset(),
				'mw',
				this.transclusion.getPlainObject()
			)
		);
	}

	this.clearPages();
	this.node = null;
	this.content = null;

	// Parent method
	ve.ui.PagedDialog.prototype.onClose.call( this );
};

/**
 * Handle add part events.
 *
 * @method
 * @param {ve.dm.MWTransclusionPartModel} part Added part
 */
ve.ui.MWTransclusionDialog.prototype.onAddPart = function ( part ) {
	var page;

	if ( part instanceof ve.dm.MWTemplateModel ) {
		page = this.getTemplatePage( part );
		part.connect( this, { 'add': 'onAddParameter', 'remove': 'onRemoveParameter' } );
	} else if ( part instanceof ve.dm.MWTransclusionContentModel ) {
		page = this.getContentPage( part );
	}
	page.index = this.getPageIndex( part ) + 1;
	if ( page ) {
		this.addPage( part.getId(), page );
	}
};

/**
 * Handle remove part events.
 *
 * @method
 * @param {ve.dm.MWTransclusionPartModel} part Removed part
 */
ve.ui.MWTransclusionDialog.prototype.onRemovePart = function ( part ) {
	var name, params;

	if ( part instanceof ve.dm.MWTemplateModel ) {
		params = part.getParameters();
		for ( name in params ) {
			this.removePage( params[name].getId() );
		}
		part.disconnect( this );
	}
	this.removePage( part.getId() );
};

/**
 * Handle add param events.
 *
 * @method
 * @param {ve.dm.MWTemplateParameterModel} param Added param
 */
ve.ui.MWTransclusionDialog.prototype.onAddParameter = function ( param ) {
	var page = this.getParameterPage( param );
	page.index = this.getPageIndex( param ) + 1;
	this.addPage( param.getId(), page );
};

/**
 * Handle remove param events.
 *
 * @method
 * @param {ve.dm.MWTemplateParameterModel} param Removed param
 */
ve.ui.MWTransclusionDialog.prototype.onRemoveParameter = function ( param ) {
	this.removePage( param.getId() );
	// Return to template page
	this.setPageByName( param.getTemplate().getId() );
};

/**
 * Set the page by name.
 *
 * Page names are always the ID of the part or param they represent.
 *
 * @method
 * @param {string} name Page name
 */
ve.ui.MWTransclusionDialog.prototype.setPageByName = function ( name ) {
	this.outlineWidget.selectItem( this.outlineWidget.getItemFromData( name ) );
};

/**
 * Get the page index of an item.
 *
 * @method
 * @param {ve.dm.MWTransclusionPartModel|ve.dm.MWTemplateParameterModel} item Part or parameter
 * @return {number} Page index of item
 */
ve.ui.MWTransclusionDialog.prototype.getPageIndex = function ( item ) {
	// Build pages from parts
	var i, iLen, j, jLen, part, names,
		parts = this.transclusion.getParts(),
		index = 0;

	// Populate pages
	for ( i = 0, iLen = parts.length; i < iLen; i++ ) {
		part = parts[i];
		if ( part === item ) {
			return index;
		}
		if ( part instanceof ve.dm.MWTemplateModel ) {
			names = part.getParameterNames();
			for ( j = 0, jLen = names.length; j < jLen; j++ ) {
				if ( part.getParameter( names[j] ) === item ) {
					return index;
				}
				index++;
			}
		}
		index++;
	}
	return -1;
};

/**
 * Synchronize pages with transclusion.
 *
 * @method
 */
ve.ui.MWTransclusionDialog.prototype.setupPages = function () {
	// Build pages from parts
	var i, iLen, j, jLen, part, param, names,
		parts = this.transclusion.getParts();

	// Populate pages
	for ( i = 0, iLen = parts.length; i < iLen; i++ ) {
		part = parts[i];
		if ( part instanceof ve.dm.MWTemplateModel ) {
			// Add template page
			this.addPage( part.getId(), this.getTemplatePage( part ) );
			// Listen for changes to parameters
			part.connect( this, { 'add': 'onAddParameter', 'remove': 'onRemoveParameter' } );
			// Add parameter pages
			names = part.getParameterNames();
			for ( j = 0, jLen = names.length; j < jLen; j++ ) {
				param = part.getParameter( names[j] );
				this.addPage( param.getId(), this.getParameterPage( param ) );
			}
		} else if ( part instanceof ve.dm.MWTransclusionContentModel ) {
			// Add wikitext page
			this.addPage( part.getId(), this.getContentPage( part ) );
		}
	}

	// Listen for changes to parts
	this.transclusion.connect( this, { 'add': 'onAddPart', 'remove': 'onRemovePart' } );
};

/**
 * Get page for transclusion content.
 *
 * @method
 * @param {ve.dm.MWTransclusionContentModel} content Content model
 */
ve.ui.MWTransclusionDialog.prototype.getContentPage = function ( content ) {
	var valueFieldset, textInput, optionsFieldset, removeButton;

	valueFieldset = new ve.ui.FieldsetLayout( {
		'$$': this.frame.$$,
		'label': ve.msg( 'visualeditor-dialog-transclusion-content' ),
		'icon': 'source'
	} );

	textInput = new ve.ui.TextInputWidget( { '$$': this.frame.$$, 'multiline': true } );
	textInput.setValue( content.getValue() );
	textInput.connect( this, { 'change': function () {
		content.setValue( textInput.getValue() );
	} } );
	textInput.$.addClass( 've-ui-mwTransclusionDialog-input' );
	valueFieldset.$.append( textInput.$ );

	optionsFieldset = new ve.ui.FieldsetLayout( {
		'$$': this.frame.$$,
		'label': ve.msg( 'visualeditor-dialog-transclusion-options' ),
		'icon': 'settings'
	} );

	removeButton = new ve.ui.ButtonWidget( {
		'$$': this.frame.$$,
		'label': ve.msg( 'visualeditor-dialog-transclusion-remove-content' ),
		'flags': ['destructive']
	} );
	removeButton.connect( this, { 'click': function () {
		content.remove();
	} } );
	optionsFieldset.$.append( removeButton.$ );

	return {
		'label': ve.msg( 'visualeditor-dialog-transclusion-content' ),
		'icon': 'source',
		'$content': valueFieldset.$.add( optionsFieldset.$ )
	};
};

/**
 * Get page for a template.
 *
 * @method
 * @param {ve.dm.MWTemplateModel} template Template model
 */
ve.ui.MWTransclusionDialog.prototype.getTemplatePage = function ( template ) {
	var infoFieldset, addParameterFieldset, addParameterInput, addParameterButton, optionsFieldset,
		removeButton, addParameter,
		spec = template.getSpec(),
		label = spec.getLabel(),
		description = spec.getDescription();

	infoFieldset = new ve.ui.FieldsetLayout( {
		'$$': this.frame.$$,
		'label': label,
		'icon': 'template'
	} );

	if ( description ) {
		infoFieldset.$.append( $( '<div>' ).text( description ) );
	}

	addParameterFieldset = new ve.ui.FieldsetLayout( {
		'$$': this.frame.$$,
		'label': ve.msg( 'visualeditor-dialog-transclusion-add-param' ),
		'icon': 'parameter'
	} );
	addParameterFieldset.$.addClass( 've-ui-mwTransclusionDialog-addParameterFieldset' );
	addParameterInput = new ve.ui.TextInputWidget( {
		'$$': this.frame.$$,
		'placeholder': ve.msg( 'visualeditor-dialog-transclusion-param-name' )
	} );
	addParameterButton = new ve.ui.ButtonWidget( {
		'$$': this.frame.$$,
		'label': ve.msg( 'visualeditor-dialog-transclusion-add-param' ),
		'disabled': true
	} );
	addParameter = function () {
		var param = template.addParameter( addParameterInput.getValue() );
		addParameterInput.setValue();
		this.setPageByName( param.getId() );
	};
	addParameterButton.connect( this, { 'click': addParameter } );
	addParameterInput.connect( this, {
		'enter': addParameter,
		'change': function ( value ) {
			var names = template.getParameterNames();
			addParameterButton.setDisabled( value === '' || names.indexOf( value ) !== -1 );
		}
	} );
	addParameterFieldset.$.append( addParameterInput.$, addParameterButton.$ );

	optionsFieldset = new ve.ui.FieldsetLayout( {
		'$$': this.frame.$$,
		'label': ve.msg( 'visualeditor-dialog-transclusion-options' ),
		'icon': 'settings'
	} );

	removeButton = new ve.ui.ButtonWidget( {
		'$$': this.frame.$$,
		'label': ve.msg( 'visualeditor-dialog-transclusion-remove-template' ),
		'flags': ['destructive']
	} );
	removeButton.connect( this, { 'click': function () {
		template.remove();
	} } );
	optionsFieldset.$.append( removeButton.$ );

	return {
		'label': label,
		'icon': 'template',
		'$content': infoFieldset.$.add( addParameterFieldset.$ ).add( optionsFieldset.$ )
	};
};

/**
 * Get page for a parameter.
 *
 * @method
 * @param {ve.dm.MWTemplateParameterModel} parameter Parameter model
 */
ve.ui.MWTransclusionDialog.prototype.getParameterPage = function ( parameter ) {
	var valueFieldset, optionsFieldset, textInput, inputLabel, removeButton,
		spec = parameter.getTemplate().getSpec(),
		name = parameter.getName(),
		label = spec.getParameterLabel( name ),
		description = spec.getParameterDescription( name );

	valueFieldset = new ve.ui.FieldsetLayout( {
		'$$': this.frame.$$,
		'label': label,
		'icon': 'parameter'
	} );

	if ( description ) {
		inputLabel = new ve.ui.InputLabelWidget( {
			'$$': this.frame.$$,
			'input': textInput,
			'label': description
		} );
		valueFieldset.$.append( inputLabel.$ );
	}

	textInput = new ve.ui.TextInputWidget( { '$$': this.frame.$$, 'multiline': true } );
	textInput.setValue( parameter.getValue() );
	textInput.connect( this, { 'change': function () {
		parameter.setValue( textInput.getValue() );
	} } );
	textInput.$.addClass( 've-ui-mwTransclusionDialog-input' );
	valueFieldset.$.append( textInput.$ );

	optionsFieldset = new ve.ui.FieldsetLayout( {
		'$$': this.frame.$$,
		'label': ve.msg( 'visualeditor-dialog-transclusion-options' ),
		'icon': 'settings'
	} );

	removeButton = new ve.ui.ButtonWidget( {
		'$$': this.frame.$$,
		'label': ve.msg( 'visualeditor-dialog-transclusion-remove-param' ),
		'flags': ['destructive']
	} );
	removeButton.connect( this, { 'click': function () {
		parameter.remove();
	} } );
	optionsFieldset.$.append( removeButton.$ );

	// TODO: Use spec.required
	// TODO: Use spec.deprecation
	// TODO: Use spec.default
	// TODO: Use spec.type

	return {
		'label': label,
		'icon': 'parameter',
		'level': 1,
		'$content': valueFieldset.$.add( optionsFieldset.$ )
	};
};

/* Registration */

ve.ui.dialogFactory.register( 'mwTransclusion', ve.ui.MWTransclusionDialog );

ve.ui.viewRegistry.register( 'mwTransclusion', ve.ui.MWTransclusionDialog );
