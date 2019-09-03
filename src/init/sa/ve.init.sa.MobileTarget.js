/*!
 * VisualEditor Standalone Initialization Mobile Target class.
 *
 * @copyright 2011-2019 VisualEditor Team and others; see http://ve.mit-license.org
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

	this.$element.addClass( 've-init-mobileTarget' );
};

/* Inheritance */

OO.inheritClass( ve.init.sa.MobileTarget, ve.init.sa.Target );

/* Static Properties */

ve.init.sa.MobileTarget.static.toolbarGroups = [
	{
		name: 'history',
		include: [ 'undo' ]
	},
	{
		name: 'style',
		header: OO.ui.deferMsg( 'visualeditor-toolbar-text-style' ),
		title: OO.ui.deferMsg( 'visualeditor-toolbar-style-tooltip' ),
		type: 'list',
		icon: 'textStyle',
		include: [ { group: 'textStyle' }, 'language', 'clear' ],
		forceExpand: [ 'bold', 'italic', 'clear' ],
		promote: [ 'bold', 'italic' ],
		demote: [ 'strikethrough', 'code', 'underline', 'language', 'clear' ]
	},
	{
		name: 'link',
		include: [ 'link' ]
	},
	{
		name: 'structure',
		header: OO.ui.deferMsg( 'visualeditor-toolbar-structure' ),
		title: OO.ui.deferMsg( 'visualeditor-toolbar-structure' ),
		type: 'list',
		icon: 'listBullet',
		include: [ { group: 'structure' } ],
		demote: [ 'outdent', 'indent' ]
	},
	{
		name: 'insert',
		header: OO.ui.deferMsg( 'visualeditor-toolbar-insert' ),
		title: OO.ui.deferMsg( 'visualeditor-toolbar-insert' ),
		type: 'list',
		icon: 'add',
		label: '',
		include: '*'
	}
];

// Move action groups into main toolbar
ve.init.sa.MobileTarget.static.toolbarGroups = ve.init.sa.MobileTarget.static.toolbarGroups.concat(
	ve.init.sa.MobileTarget.static.actionGroups
);

ve.init.sa.MobileTarget.static.actionGroups = [];
