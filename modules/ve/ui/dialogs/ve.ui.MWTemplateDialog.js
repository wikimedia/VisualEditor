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
	// Buffer for getTemplateSpecs
	this.fetchQueue = [];
	this.fetchCallbacks = $.Callbacks();
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
	var i, progress, len, template,
		dialog = this;

	function increaseProgress() {
		progress++;
		if ( progress === len ) {
			dialog.setupPages();
		}
	}

	function makeStoreTemplateSpec( template ) {
		return function ( specs ) {
			template.spec = specs[template.specId];
			increaseProgress();
		};
	}

	dialog.node = dialog.surface.getView().getFocusedNode();
	if ( !dialog.node ) {
		throw new Error( 'No focused node to edit' );
	}

	// Get content values and copy it so we can safely change it to our liking
	dialog.content = ve.copyObject( dialog.node.getModel().getAttribute( 'mw' ) );

	// Convert single template format to multiple template format
	if ( dialog.content.params ) {
		dialog.content = {
			'parts': [
				{
					'template': dialog.content
				}
			]
		};
	}

	progress = -1;
	len = dialog.content.parts.length;

	// Get all template specs asynchronously
	for ( i = 0; i < len; i++ ) {
		template = dialog.content.parts[i].template;
		if ( template ) {
			// Method #getTemplateSpecs will use the part id instead of `target.url`
			// if the target has no url property (which Parsoid omits if the target is
			// dynamically generated from wikitext). In that case we want each template
			// invocation to have its own inferred template spec.
			template.specId = template.target.url || ( '#!/part/' + i );
			dialog.getTemplateSpecs( template, makeStoreTemplateSpec( template ) );
		} else {
			// This is a raw wikitext part (between two associated template invocations),
			// wrap in object so editor has something to reference
			dialog.content.parts[i] = { 'wt': dialog.content.parts[i] };
			increaseProgress();
		}
	}

	increaseProgress();
};

/**
 * Handle window close events.
 *
 * @param {string} action Action that caused the window to be closed
 */
ve.ui.MWTemplateDialog.prototype.onClose = function ( action ) {
	var i, len, parts,
		surfaceModel = this.surface.getModel();

	// Save changes
	if ( action === 'apply' ) {

		// Undo non-standard changes we made to the content model in #onOpen
		parts = this.content.parts;

		for ( i = 0, len = parts.length; i < len; i++ ) {

			// Convert object part with wt property back to string part
			if ( typeof parts[i].wt === 'string' ) {
				parts[i] = parts[i].wt;
			}

			// Remove the properties #onOpen put here
			if ( parts[i].template ) {
				if ( parts[i].template.spec ) {
					delete parts[i].template.spec;
				}
				if ( parts[i].template.specId ) {
					delete parts[i].template.specId;
				}
			}
		}

		// Restore single template format
		if ( this.content.parts.length === 1 ) {
			this.content = this.content.parts[0].template;
		}

		// TODO: Wrap attribute changes in ve.dm.SurfaceFragment
		surfaceModel.change(
			ve.dm.Transaction.newFromAttributeChange(
				surfaceModel.getDocument(),
				this.node.getOffset(),
				'mw',
				this.content
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
 * Handle template data load events.
 *
 * @method
 */
ve.ui.MWTemplateDialog.prototype.setupPages = function () {
	// Build pages from parts
	var i, len, template, spec, param,
		parts = this.content.parts;

	// Parent method
	ve.ui.PagedDialog.prototype.onOpen.call( this );

	// Populate pages
	for ( i = 0, len = parts.length; i < len; i++ ) {
		if ( parts[i].template ) {
			template = parts[i].template;
			spec = template.spec;
			// Add template page
			this.addTemplatePage( 'part_' + i, template );
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
 * Backfill missing template data based on template invocation.
 * @param {Object} template Template invocation description
 * @return {Object} Template data blob
 */
ve.ui.MWTemplateDialog.static.makeTemplateSpec = function ( params ) {
	var key, blob;

	blob = {
		description: null,
		params: {},
		sets: []
	};
	for ( key in params ) {
		blob.params[key] = {
			'label': {
				en: key
			},
			'required': false,
			'description': null,
			'deprecated': false,
			'aliases': [],
			'default': '',
			'type': 'string'

		};
	}
	return blob;
};

/**
 * Get template specs for one or more templates in the content model.
 *
 * @param {Object[]|undefined} templates List of template invocation descriptions. Contains `title` and
 * `params` properties. Or undefined to handle the queue built so far.
 * @param {Function} callback
 * @param {Object} callback.blobs Object containing template data blobs keyed by page title.
 */
ve.ui.MWTemplateDialog.prototype.getTemplateSpecs = function ( templates, callback ) {
	var fillTemplateSpecs,
		dialog = this;

	// Yield once with setTimeout before fetching to allow batching
	if ( callback ) {
		dialog.fetchCallbacks.add( callback );
	}
	if ( templates ) {
		templates = ve.isArray( templates ) ? templates : [ templates ];
		// Push into the queue
		dialog.fetchQueue.push.apply( dialog.fetchQueue, templates );
		setTimeout( function () {
			dialog.getTemplateSpecs();
		} );
		return;
	} else if ( dialog.fetchQueue.length ) {
		// Handle batch queue
		templates = dialog.fetchQueue.slice();
		dialog.fetchQueue.length = 0;
	} else {
		// This a delayed call but a previous delayed call already
		// cleared the queue for us. This call has become redundant.
		return;
	}

	fillTemplateSpecs = function ( specs ) {
		var i, len, template, specId;
		for ( i = 0, len = templates.length; i < len; i++ ) {
			template = templates[i];
			specId = template.specId;
			if ( !specs[specId] ) {
				specs[specId] = dialog.constructor.static.makeTemplateSpec( template );
			}
		}
		dialog.fetchCallbacks.fireWith( null, [ specs ] );
	};

	dialog.fetchTemplateSpecs( templates )
		.done( fillTemplateSpecs )
		.fail( function () {
			fillTemplateSpecs( {} );
		} );
};

/**
 * Fetch template data from the TemplateData API.
 *
 * @param {Object[]} templates List of template invocation descriptions
 * @return {jQuery.Promise}
 */
ve.ui.MWTemplateDialog.prototype.fetchTemplateSpecs = function ( templates ) {
	var i, len,
		d = $.Deferred(),
		titles = [],
		specs = {};

	// Collect all titles
	for ( i = 0, len = templates.length; i < len; i++ ) {
		if ( templates[i].target.url ) {
			titles.push( templates[i].target.url );
		}
	}

	// Optimise for empty lists
	if ( !templates.length ) {
		setTimeout( d.reject );
		return d.promise();
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
			var i, len, id;
			if ( data && data.pages ) {
				for ( id in data.pages ) {
					specs[data.pages[id].title] = data.pages[id];
				}
				if ( data.normalized ) {
					for ( i = 0, len = data.normalized.length; i < len; i++ ) {
						specs[ data.normalized[i].from ] = specs[ data.normalized[i].to ];
					}
				}
				d.resolve( specs );
			} else {
				d.reject( 'unavailable', arguments );
			}
		} )
		.fail( function () {
			d.reject( 'http', arguments );
		} );

	return d.promise();
};

/**
 * Add page for wikitext.
 *
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
	textInput.setValue( value.wt );
	textInput.on( 'change', function () {
		value.wt = textInput.getValue();
	} );
	textInput.$.addClass( 've-ui-mwTemplateDialog-input' );
	fieldset.$.append( textInput.$ );

	this.addPage( page, { 'label': 'Content', 'icon': 'source' } );
	this.pages[page].$.append( fieldset.$ );
};

/**
 * Add page for a template.
 *
 * @param {string} page Unique page name
 * @param {Object} template Template info
 */
ve.ui.MWTemplateDialog.prototype.addTemplatePage = function ( page, template ) {
	var fieldset,
		label = template.target.url || template.target.wt;

	fieldset = new ve.ui.FieldsetLayout( {
		'$$': this.frame.$$,
		'label': label,
		'icon': 'template'
	} );

	this.addPage( page, { 'label': label, 'icon': 'template' } );
	this.pages[page].$.append( fieldset.$ );
};

/**
 * Add page for a parameter.
 *
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
	textInput.setValue( value.wt );
	textInput.on( 'change', function () {
		value.wt = textInput.getValue();
	} );
	textInput.$.addClass( 've-ui-mwTemplateDialog-input' );
	fieldset.$.append( textInput.$ );

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
	this.pages[page].$.append( fieldset.$ );
};

/* Registration */

ve.ui.dialogFactory.register( 'mwTemplate', ve.ui.MWTemplateDialog );

ve.ui.viewRegistry.register( 'mwTemplate', ve.ui.MWTemplateDialog );
