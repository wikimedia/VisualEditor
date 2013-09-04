/*!
 * VisualEditor Experimental UserInterface tool classes.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface code tool.
 *
 * @class
 * @extends ve.ui.AnnotationTool
 * @constructor
 * @param {ve.ui.SurfaceToolbar} toolbar
 * @param {Object} [config] Config options
 */
ve.ui.CodeAnnotationTool = function VeUiCodeAnnotationTool( toolbar, config ) {
	ve.ui.AnnotationTool.call( this, toolbar, config );
};
ve.inheritClass( ve.ui.CodeAnnotationTool, ve.ui.AnnotationTool );
ve.ui.CodeAnnotationTool.static.name = 'code';
ve.ui.CodeAnnotationTool.static.group = 'textStyle';
ve.ui.CodeAnnotationTool.static.icon = 'code';
ve.ui.CodeAnnotationTool.static.titleMessage = 'visualeditor-annotationbutton-code-tooltip';
ve.ui.CodeAnnotationTool.static.annotation = { 'name': 'textStyle/code' };
ve.ui.toolFactory.register( ve.ui.CodeAnnotationTool );

/**
 * UserInterface code tool.
 *
 * @class
 * @extends ve.ui.AnnotationTool
 * @constructor
 * @param {ve.ui.SurfaceToolbar} toolbar
 * @param {Object} [config] Config options
 */
ve.ui.StrikethroughAnnotationTool = function VeUiStrikethroughAnnotationTool( toolbar, config ) {
	ve.ui.AnnotationTool.call( this, toolbar, config );
};
ve.inheritClass( ve.ui.StrikethroughAnnotationTool, ve.ui.AnnotationTool );
ve.ui.StrikethroughAnnotationTool.static.name = 'strikethrough';
ve.ui.StrikethroughAnnotationTool.static.group = 'textStyle';
ve.ui.StrikethroughAnnotationTool.static.icon = {
	'default': 'strikethrough-a',
	'en': 'strikethrough-s'
};
ve.ui.StrikethroughAnnotationTool.static.titleMessage =
	'visualeditor-annotationbutton-strikethrough-tooltip';
ve.ui.StrikethroughAnnotationTool.static.annotation = { 'name': 'textStyle/strike' };
ve.ui.toolFactory.register( ve.ui.StrikethroughAnnotationTool );

/**
 * UserInterface underline tool.
 *
 * @class
 * @extends ve.ui.AnnotationTool
 * @constructor
 * @param {ve.ui.SurfaceToolbar} toolbar
 * @param {Object} [config] Config options
 */
ve.ui.UnderlineAnnotationTool = function VeUiUnderlineAnnotationTool( toolbar, config ) {
	ve.ui.AnnotationTool.call( this, toolbar, config );
};
ve.inheritClass( ve.ui.UnderlineAnnotationTool, ve.ui.AnnotationTool );
ve.ui.UnderlineAnnotationTool.static.name = 'underline';
ve.ui.UnderlineAnnotationTool.static.group = 'textStyle';
ve.ui.UnderlineAnnotationTool.static.icon = {
	'default': 'underline-a',
	'en': 'underline-u'
};
ve.ui.UnderlineAnnotationTool.static.titleMessage =
	'visualeditor-annotationbutton-underline-tooltip';
ve.ui.UnderlineAnnotationTool.static.annotation = { 'name': 'textStyle/underline' };
ve.ui.toolFactory.register( ve.ui.UnderlineAnnotationTool );

/**
 * UserInterface subscript tool.
 *
 * @class
 * @extends ve.ui.AnnotationTool
 * @constructor
 * @param {ve.ui.SurfaceToolbar} toolbar
 * @param {Object} [config] Config options
 */
ve.ui.SubscriptAnnotationTool = function VeUiSubscriptAnnotationTool( toolbar, config ) {
	ve.ui.AnnotationTool.call( this, toolbar, config );
};
ve.inheritClass( ve.ui.SubscriptAnnotationTool, ve.ui.AnnotationTool );
ve.ui.SubscriptAnnotationTool.static.name = 'subscript';
ve.ui.SubscriptAnnotationTool.static.group = 'textStyle';
ve.ui.SubscriptAnnotationTool.static.icon = 'subscript';
ve.ui.SubscriptAnnotationTool.static.titleMessage =
	'visualeditor-annotationbutton-subscript-tooltip';
ve.ui.SubscriptAnnotationTool.static.annotation = { 'name': 'textStyle/subscript' };
ve.ui.toolFactory.register( ve.ui.SubscriptAnnotationTool );

/**
 * UserInterface superscript tool.
 *
 * @class
 * @extends ve.ui.AnnotationTool
 * @constructor
 * @param {ve.ui.SurfaceToolbar} toolbar
 * @param {Object} [config] Config options
 */
ve.ui.SuperscriptAnnotationTool = function VeUiSuperscriptAnnotationTool( toolbar, config ) {
	ve.ui.AnnotationTool.call( this, toolbar, config );
};
ve.inheritClass( ve.ui.SuperscriptAnnotationTool, ve.ui.AnnotationTool );
ve.ui.SuperscriptAnnotationTool.static.name = 'superscript';
ve.ui.SuperscriptAnnotationTool.static.group = 'textStyle';
ve.ui.SuperscriptAnnotationTool.static.icon = 'superscript';
ve.ui.SuperscriptAnnotationTool.static.titleMessage =
	'visualeditor-annotationbutton-superscript-tooltip';
ve.ui.SuperscriptAnnotationTool.static.annotation = { 'name': 'textStyle/superscript' };
ve.ui.toolFactory.register( ve.ui.SuperscriptAnnotationTool );

/**
 * UserInterface language tool.
 *
 * @class
 * @extends ve.ui.InspectorTool
 * @constructor
 * @param {ve.ui.SurfaceToolbar} toolbar
 * @param {Object} [config] Config options
 */
ve.ui.LanguageInspectorTool = function VeUiLanguageInspectorTool( toolbar, config ) {
	ve.ui.InspectorTool.call( this, toolbar, config );
};
ve.inheritClass( ve.ui.LanguageInspectorTool, ve.ui.InspectorTool );
ve.ui.LanguageInspectorTool.static.name = 'language';
ve.ui.LanguageInspectorTool.static.group = 'meta';
ve.ui.LanguageInspectorTool.static.icon = 'language';
ve.ui.LanguageInspectorTool.static.titleMessage = 'visualeditor-annotationbutton-language-tooltip';
ve.ui.LanguageInspectorTool.static.inspector = 'language';
ve.ui.LanguageInspectorTool.static.modelClasses = [ ve.dm.LanguageAnnotation ];
ve.ui.toolFactory.register( ve.ui.LanguageInspectorTool );
