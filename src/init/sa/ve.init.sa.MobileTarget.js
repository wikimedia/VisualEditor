/*!
 * VisualEditor Standalone Initialization Mobile Target class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Initialization standalone mobile target.
 *
 * @class
 * @extends ve.init.sa.Target
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {Object} [toolbarConfig] Configuration options for the toolbar
 */
ve.init.sa.MobileTarget = function VeInitSaMobileTarget( config ) {
	// Parent constructor
	ve.init.sa.MobileTarget.super.call( this, config );
};

/* Inheritance */

OO.inheritClass( ve.init.sa.MobileTarget, ve.init.sa.Target );

/* Static Properties */

ve.init.sa.MobileTarget.static.toolbarGroups = [
	// History
	{ include: [ 'undo' ] },
	// Style
	{
		header: OO.ui.deferMsg( 'visualeditor-toolbar-text-style' ),
		title: OO.ui.deferMsg( 'visualeditor-toolbar-style-tooltip' ),
		classes: [ 've-test-toolbar-style' ],
		type: 'list',
		icon: 'textStyle',
		include: [ { group: 'textStyle' }, 'language', 'clear' ],
		forceExpand: [ 'bold', 'italic', 'clear' ],
		promote: [ 'bold', 'italic' ],
		demote: [ 'strikethrough', 'code', 'underline', 'language', 'clear' ]
	},
	// Link
	{ include: [ 'link' ] },
	// Structure
	{
		header: OO.ui.deferMsg( 'visualeditor-toolbar-structure' ),
		title: OO.ui.deferMsg( 'visualeditor-toolbar-structure' ),
		type: 'list',
		icon: 'listBullet',
		include: [ { group: 'structure' } ],
		demote: [ 'outdent', 'indent' ]
	},
	// Insert
	{
		header: OO.ui.deferMsg( 'visualeditor-toolbar-insert' ),
		title: OO.ui.deferMsg( 'visualeditor-toolbar-insert' ),
		type: 'list',
		icon: 'add',
		label: '',
		include: '*'
	}
];

/* Methods */

/**
 * @inheritdoc
 */
ve.init.sa.MobileTarget.prototype.setupToolbar = function ( surface ) {
	// Parent method
	ve.init.sa.MobileTarget.super.prototype.setupToolbar.call( this, surface );

	this.getToolbar().$bar.append( surface.context.$element );
};
