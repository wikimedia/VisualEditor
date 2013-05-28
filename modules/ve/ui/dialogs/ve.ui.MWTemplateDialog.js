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

	// Properties
	this.node = null;
	this.content = null;
	this.specs = {};
};

/* Inheritance */

ve.inheritClass( ve.ui.MWTemplateDialog, ve.ui.PagedDialog );

/* Static Properties */

ve.ui.MWTemplateDialog.static.titleMessage = 'visualeditor-dialog-template-title';

ve.ui.MWTemplateDialog.static.icon = 'template';

ve.ui.MWTemplateDialog.static.modelClasses = [ ve.dm.MWTemplateNode ];

/* Methods */

/**
 * Handle frame open events.
 *
 * @method
 */
ve.ui.MWTemplateDialog.prototype.onOpen = function () {
	var i, len, template, title,
		templates = [];

	this.node = this.surface.getView().getFocusedNode();
	if ( !this.node ) {
		throw new Error( 'No focused node to edit' );
	}

	// Get content values
	this.content = ve.copyObject( this.node.getModel().getAttribute( 'mw' ) );
	// Convert single template format to multiple template format
	if ( this.content.params ) {
		this.content = { 'parts': [ { 'template': this.content } ] };
	}
	// Get all template data asynchronously
	for ( i = 0, len = this.content.parts.length; i < len; i++ ) {
		template = this.content.parts[i].template;
		if ( template ) {
			if ( template.target.url ) {
				try {
					title = new mw.Title( template.target.url );
					templates.push( {
						'title': title.toString(),
						'params': template.params
					} );
				} catch ( e ) {}
			}
		} else {
			// Wrap plain wikitext in object so editor has something to reference
			this.content.parts[i] = { 'wt': this.content.parts[i] };
		}
	}
	if ( templates.length ) {
		this.getTemplateData( templates )
			.done( ve.bind( function ( specs ) {
				this.specs = specs;
			}, this ) )
			.always( ve.bind( this.setupPages, this ) );
	} else {
		this.setupPages();
	}
};

/**
 * Handle window close events.
 *
 * @method
 * @param {string} action Action that caused the window to be closed
 */
ve.ui.MWTemplateDialog.prototype.onClose = function ( action ) {
	var i, len, wt,
		surfaceModel = this.surface.getModel();

	// Save changes
	if ( action === 'apply' ) {
		// Expand wikitext content
		for ( i = 0, len = this.content.parts.length; i < len; i++ ) {
			wt = this.content.parts[i].wt;
			if ( typeof wt === 'string' ) {
				// Replace object wrapper with plain text
				this.content.parts[i] = wt;
			}
		}
		// Restore single template format
		if ( this.content.parts.length === 1 ) {
			this.content = this.content.parts[0].template;
		}
		// TODO: Wrap attribute changes in ve.dm.SurfaceFragment
		surfaceModel.change(
			ve.dm.Transaction.newFromAttributeChange(
				surfaceModel.getDocument(), this.node.getOffset(), 'mw', this.content
			)
		);
	}

	this.clearPages();
	this.node = null;
	this.content = null;
	this.specs = {};

	// Parent method
	ve.ui.PagedDialog.prototype.onClose.call( this );
};

/**
 * Handle template data load events.
 *
 * @method
 */
ve.ui.MWTemplateDialog.prototype.setupPages = function () {
	// Build pages from parts
	var i, len, template, spec, param,
		parts = this.content.parts,
		specs = this.specs;

	// Parent method
	ve.ui.PagedDialog.prototype.onOpen.call( this );

	// Populate pages
	for ( i = 0, len = parts.length; i < len; i++ ) {
		if ( parts[i].template ) {
			template = parts[i].template;
			spec = specs[template.target.url];
			// Add template page
			this.addPage( 'part_' + i, { 'label': template.target.url, 'icon': 'template' } );
			// Add parameter pages
			for ( param in template.params ) {
				this.addParameterPage(
					'part_' + i + '_param_' + param,
					param,
					template.params[param],
					spec.params[param]
				);
			}
		} else if ( parts[i].wt ) {
			// Add wikitext page
			this.addWikitextPage( 'part_' + i, parts[i] );
		}
	}
};

/**
 * Get a promise for template data.
 *
 * TODO: Backfill template info from params objects
 *
 * @method
 * @param {Object[]} templates Template information containing `title` and `params` properties
 * @return {jQuery.Promise} Template data blob on success, or an error code on failure
 */
ve.ui.MWTemplateDialog.prototype.getTemplateData = function ( templates ) {
	var i, len,
		titles = [],
		specs = {},
		deferred = $.Deferred();

	// Collect all titles
	for ( i = 0, len = templates.length; i < len; i++ ) {
		titles.push( templates[i].title );
	}

	// Request template data from server
	$.ajax( {
		'url': mw.util.wikiScript( 'api' ),
		'dataType': 'json',
		'data': {
			'format': 'json',
			'action': 'templatedata',
			'titles': titles.join( '|' )
		}
	} )
		.done( function ( data ) {
			var id;
			if ( data && data.pages ) {
				// Add template data to spec
				for ( id in data.pages ) {
					specs[data.pages[id].title] = data.pages[id];
				}
				deferred.resolve( specs );
			}
			deferred.reject( 'unavailable', arguments );
		} )
		.fail( function () {
			deferred.reject( 'http', arguments );
		} );

	return deferred.promise();
};

/**
 * Add page for wikitext.
 *
 * @method
 * @param {string} page Unique page name
 * @param {Object} value Parameter value
 */
ve.ui.MWTemplateDialog.prototype.addWikitextPage = function ( page, value ) {
	var fieldset, textInput;

	fieldset = new ve.ui.FieldsetLayout( {
		'$$': this.frame.$$,
		'label': 'Content',
		'icon': 'source'
	} );

	textInput = new ve.ui.TextInputWidget( { '$$': this.frame.$$, 'multiline': true } );
	textInput.$input.css( { 'height': 100, 'width': '100%' } );
	textInput.setValue( value.wt );
	textInput.on( 'change', function () {
		value.wt = textInput.getValue();
	} );

	this.addPage( page, { 'label': 'Content', 'icon': 'source' } );
	this.pages[page].$.append( fieldset.$.append( textInput.$ ) );
};

/**
 * Add page for a parameter.
 *
 * @method
 * @param {string} page Unique page name
 * @param {string} name Parameter name
 * @param {Object} value Parameter value
 * @param {Object} spec Parameter specification
 */
ve.ui.MWTemplateDialog.prototype.addParameterPage = function ( page, name, value, spec ) {
	var fieldset, textInput, inputLabel,
		label = spec && spec.label ? spec.label.en : name,
		description = spec && spec.description && spec.description.en;

	fieldset = new ve.ui.FieldsetLayout( {
		'$$': this.frame.$$,
		'label': label,
		'icon': 'parameter'
	} );

	textInput = new ve.ui.TextInputWidget( { '$$': this.frame.$$, 'multiline': true } );
	textInput.$input.css( { 'height': 100, 'width': '100%' } );
	textInput.setValue( value.wt );
	textInput.on( 'change', function () {
		value.wt = textInput.getValue();
	} );

	if ( description  ) {
		inputLabel = new ve.ui.InputLabelWidget( {
			'$$': this.frame.$$,
			'input': textInput,
			'label': description
		} );
		fieldset.$.append( inputLabel.$ );
	}

	// TODO: Use spec.required
	// TODO: Use spec.deprecation
	// TODO: Use spec.default
	// TODO: Use spec.type

	this.addPage( page, { 'label': label, 'icon': 'parameter', 'level': 1 } );
	this.pages[page].$.append( fieldset.$.append( textInput.$ ) );
};

/* Registration */

ve.ui.dialogFactory.register( 'mwTemplate', ve.ui.MWTemplateDialog );

ve.ui.viewRegistry.register( 'mwTemplate', ve.ui.MWTemplateDialog );
