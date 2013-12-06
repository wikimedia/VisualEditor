/*!
 * VisualEditor MediaWiki Initialization MobileViewTarget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw*/

/**
 *
 * @class
 * @extends ve.init.mw.Target
 *
 * @constructor
 * @param {jQuery} $container Container to render target into
 */
ve.init.mw.MobileViewTarget = function VeInitMwMobileViewTarget( $el ) {
	var currentUri = new mw.Uri();

	// Parent constructor
	ve.init.mw.Target.call(
		this, $el, mw.config.get( 'wgRelevantPageName' ), currentUri.query.oldid
	);

	// Events
	this.connect( this, {
		'surfaceReady': 'onSurfaceReady'
	} );
};

/* Inheritance */

OO.inheritClass( ve.init.mw.MobileViewTarget, ve.init.mw.Target );

/* Static Properties */

ve.init.mw.MobileViewTarget.static.toolbarGroups = [
	{ 'include': [ 'undo', 'redo' ] },
	{
		'type': 'menu',
		'include': [ { 'group': 'format' } ],
		'promote': [ 'paragraph' ],
		'demote': [ 'preformatted', 'heading1' ]
	},
	{ 'include': [ 'bold', 'italic', 'link', 'clear' ] },
	{ 'include': [ 'number', 'bullet', 'outdent', 'indent' ] },
	{ 'include': '*', 'exclude': [ { 'group': 'format' }, 'reference', 'referenceList', 'mediaEdit', 'mediaInsert', 'transclusion' ] }
];

ve.init.mw.MobileViewTarget.static.surfaceCommands = [
	'undo',
	'redo',
	'bold',
	'italic',
	'link',
	'clear',
	'underline',
	'subscript',
	'superscript',
	'indent',
	'outdent',
	'paragraph',
	'heading1',
	'heading2',
	'heading3',
	'heading4',
	'heading5',
	'heading6',
	'preformatted'
];

/* Methods */

/**
 * Once surface is ready ready, init UI.
 */
ve.init.mw.MobileViewTarget.prototype.onSurfaceReady = function () {
	this.$document[0].focus();
};
