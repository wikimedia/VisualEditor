/*!
 * VisualEditor user interface MWTemplateDialog class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

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
ve.ui.MWTemplateDialog = function VeUiMWTemplateDialog( surface, config ) {
	// Parent constructor
	ve.ui.PagedDialog.call( this, surface, config );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWTemplateDialog, ve.ui.PagedDialog );

/* Static Properties */

ve.ui.MWTemplateDialog.static.titleMessage = 'visualeditor-dialog-template-title';

ve.ui.MWTemplateDialog.static.icon = 'template';

ve.ui.MWTemplateDialog.static.modelClasses = [ ve.dm.MWTemplateNode ];

/* Methods */

/**
 * Handle frame ready events.
 */
ve.ui.MWTemplateDialog.prototype.onOpen = function () {
	var self = this,
		mwAttr = this.surface.view.focusedNode.model.getAttribute( 'mw' );

	function handle( templateData ) {
		var param,
			paramsData = templateData && templateData.params;
		self.paramsKeys = [];
		self.paramsToInputs = {};

		// Parent method
		ve.ui.PagedDialog.prototype.onOpen.call( self );

		// Add template page
		self.addPage( 'template', mwAttr.target.wt, 'template' );

		// Loop through parameters
		for ( param in mwAttr.params ) {
			self.createParamPage(
				param,
				mwAttr.params[param],
				paramsData && paramsData[param]
			);
		}

		// TODO: Ability to remove parameters
		// TODO: Ability to add other parameters in paramsData
		// Also account for paramsData#aliases
		// TODO: Ability to add arbitrary parameters
		// TODO: Use templateData.sets
	}

	this.getTemplateData( mwAttr.target )
		.done( handle )
		.fail( function ( errorCode, details ) {
			mw.log( 'TemplateData unavailable: ' + errorCode, mwAttr.target, details );
			handle();
		} );
};

/**
 * Handle creating page for single parameter.
 *
 * @param {string} key Template parameter name
 * @param {Object} value Value container with `wt` property
 * @param {Object} paramData Param object from TemplateData
 */
ve.ui.MWTemplateDialog.prototype.createParamPage = function ( key, value, paramData ) {
	var fieldset, textInput, inputLabel,
		pageName = 'parameter_' + key,
		label = paramData && paramData.label ? paramData.label.en : key,
		description = paramData && paramData.description && paramData.description.en;

	// Label
	fieldset = new ve.ui.FieldsetLayout( {
		'$$': this.$$,
		'label': label,
		'icon': 'parameter'
	} );

	textInput = new ve.ui.TextInputWidget( {
		'$$': this.$$,
		'multiline': true
	} );
	textInput.$input.css( 'height', 100 );
	textInput.setValue( value.wt );

	// TODO: Use paramData.requred
	// TODO: Use paramData.deprecation
	// TODO: Use paramData.default
	// TODO: Use paramData.type
	fieldset = new ve.ui.FieldsetLayout( { '$$': this.frame.$$, 'label': label, 'icon': 'parameter' } );
	textInput = new ve.ui.TextInputWidget( { '$$': this.frame.$$, 'multiline': true } );
	textInput.$input.css('height', 100);

	if ( description  ) {
		inputLabel = new ve.ui.InputLabelWidget( {
			'$$': this.frame.$$,
			'input': textInput,
			'label': description
		} );
		fieldset.$.append( inputLabel.$ );
	}

	fieldset.$.append( textInput.$ );

	this.addPage( pageName, label, 'parameter', 1 );
	this.pages[pageName].$.append( fieldset.$ );

	this.paramsKeys.push( key );
	this.paramsToInputs[key] = textInput;
};

/**
 * @param {Object} template Information about the template target from Parsoid.
 *  Contains a `wt` property containing the wikitext of the invocation target.
 *  This is unprocessed so it can start with : and/or lack the proper namespace
 *  prefix for templates in the Template namespace.
 * @return {jQuery.Promise} Template data blob on success, or an error code on failure.
 */
ve.ui.MWTemplateDialog.prototype.getTemplateData = function ( template ) {
	var title,
		d = $.Deferred();
	if ( !template.wt || template.wt.indexOf( '{' ) !== -1 ) {
		// Name contains wikitext, need Parsoid to provide name (bug 48663)
		d.reject( 'complicated' );
	}
	// In sample cases we'll handle the namespace fallback (should ultimately
	// be done by Parsoid, bug 48663). If the title has no namespace prefix,
	// assume NS_TEMPLATE namespace (like MediaWiki does)
	title = new mw.Title( template.wt );
	if ( title.getNamespaceId() === 0 && title.toString()[0] !== ':' ) {
		title = new mw.Title( template.wt, mw.config.get( 'wgNamespaceIds' ).template );
	}
	title = title.toString();
	$.ajax( {
		'url': mw.util.wikiScript( 'api' ),
		'dataType': 'json',
		'data': {
			'format': 'json',
			'action': 'templatedata',
			'titles': title
		}
	} ).done( function ( data ) {
		var pageid, page;
		if ( data && data.pages ) {
			for ( pageid in data.pages ) {
				page = data.pages[pageid];
				if ( page.title === title ) {
					d.resolve( page );
					return;
				}
			}
		}
		d.reject( 'unavailable', arguments );
	} ).fail( function () {
		d.reject( 'http', arguments );
	} );

	return d.promise();
};

/**
 * Handle frame ready events.
 *
 * @param {string} action Action that caused the window to be closed
 */
ve.ui.MWTemplateDialog.prototype.onClose = function ( action ) {
	var mwAttr, i;
	// Parent method
	ve.ui.PagedDialog.prototype.onOpen.call( this );

	if ( action === 'apply' ) {
		mwAttr = ve.cloneObject( this.surface.view.focusedNode.model.getAttribute( 'mw' ) );
		mwAttr.params = {};
		for ( i = 0; i < this.paramsKeys.length; i++ ) {
			mwAttr.params[this.paramsKeys[i]] = {
				'wt': this.paramsToInputs[this.paramsKeys[i]].getValue()
			};
		}
		this.surface.model.change(
			ve.dm.Transaction.newFromAttributeChange(
				this.surface.model.documentModel,
				this.surface.view.focusedNode.getOffset(),
				'mw',
				mwAttr
			)
		);
	}

	this.clearPages();
};

/* Registration */

ve.ui.dialogFactory.register( 'mwTemplate', ve.ui.MWTemplateDialog );

ve.ui.viewRegistry.register( 'mwTemplate', ve.ui.MWTemplateDialog );
