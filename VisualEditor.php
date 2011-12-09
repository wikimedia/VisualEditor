<?php
/**
 * VisualEditor extension
 * 
 * @file
 * @ingroup Extensions
 * 
 * @author Trevor Parscal <trevor@wikimedia.org>
 * @author Inez Korczyński <inez@wikia-inc.com>
 * @author Roan Kattouw <roan.kattouw@gmail.com>
 * @author Neil Kandalgaonkar <neilk@wikimedia.org>
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 * @author Brion Vibber <brion@wikimedia.org>
 * @license GPL v2 or later
 * @version 0.1.0
 */

/* Setup */

$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'VisualEditor',
	'author' => array(
		'Trevor Parscal',
		'Inez Korczyński',
		'Roan Kattouw',
		'Neil Kandalgaonkar',
		'Gabriel Wicke',
		'Brion Vibber',
	),
	'version' => '0.1.0',
	'url' => 'http://www.mediawiki.org/wiki/Extension:VisualEditor',
	'descriptionmsg' => 'visualeditor-desc',
);
$dir = dirname( __FILE__ ) . '/';
$wgExtensionMessagesFiles['VisualEditor'] = $dir . 'VisualEditor.i18n.php';
$wgExtensionMessagesFiles['VisualEditorAliases'] = $dir . 'VisualEditor.alias.php';
$wgAutoloadClasses['SpecialVisualEditorSandbox'] = $dir . 'SpecialVisualEditorSandbox.php';
$wgSpecialPages['VisualEditorSandbox'] = 'SpecialVisualEditorSandbox';
$wgSpecialPageGroups['VisualEditorSandbox'] = 'other';

$wgVisualEditorResourceTemplate = array(
	'localBasePath' => dirname( __FILE__ ) . '/modules',
	'remoteExtPath' => 'VisualEditor/modules',
	'group' => 'ext.visualEditor',
);

$wgResourceModules += array(
	'ext.visualEditor.sandbox' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'sandbox/sandbox.js',
		),
		'styles' => 'sandbox/sandbox.css',
		'messages' => array(),
		'dependencies' => array(
			'ext.visualEditor.es',
		),
	),
	'ext.visualEditor.es' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'es/es.js',
			'es/es.Html.js',
			'es/es.Position.js',
			'es/es.Range.js',
			'es/es.TransactionProcessor.js',
			'es/bases/es.EventEmitter.js',
			'es/bases/es.DocumentNode.js',
			'es/bases/es.DocumentBranchNode.js',
			'es/bases/es.DocumentLeafNode.js',
			'es/bases/es.DocumentModelNode.js',
			'es/bases/es.DocumentModelBranchNode.js',
			'es/bases/es.DocumentModelLeafNode.js',
			'es/bases/es.DocumentViewNode.js',
			'es/bases/es.DocumentViewBranchNode.js',
			'es/bases/es.DocumentViewLeafNode.js',
			'es/bases/es.Inspector.js',
			'es/bases/es.Tool.js',
			'es/models/es.DocumentModel.js',
			'es/models/es.HeadingModel.js',
			'es/models/es.ListItemModel.js',
			'es/models/es.ListModel.js',
			'es/models/es.ParagraphModel.js',
			'es/models/es.PreModel.js',
			'es/models/es.SurfaceModel.js',
			'es/models/es.TableCellModel.js',
			'es/models/es.TableModel.js',
			'es/models/es.TableRowModel.js',
			'es/models/es.TransactionModel.js',
			'es/serializers/es.AnnotationSerializer.js',
			'es/serializers/es.HtmlSerializer.js',
			'es/serializers/es.JsonSerializer.js',
			'es/serializers/es.WikitextSerializer.js',
			'es/inspectors/es.LinkInspector.js',
			'es/tools/es.ButtonTool.js',
			'es/tools/es.AnnotationButtonTool.js',
			'es/tools/es.ClearButtonTool.js',
			'es/tools/es.HistoryButtonTool.js',
			'es/tools/es.ListButtonTool.js',
			'es/tools/es.IndentationButtonTool.js',
			'es/tools/es.DropdownTool.js',
			'es/tools/es.FormatDropdownTool.js',
			'es/views/es.ContextView.js',
			'es/views/es.ContentView.js',
			'es/views/es.DocumentView.js',
			'es/views/es.HeadingView.js',
			'es/views/es.ListItemView.js',
			'es/views/es.ListView.js',
			'es/views/es.MenuView.js',
			'es/views/es.ParagraphView.js',
			'es/views/es.PreView.js',
			'es/views/es.SurfaceView.js',
			'es/views/es.TableCellView.js',
			'es/views/es.TableRowView.js',
			'es/views/es.TableView.js',
			'es/views/es.ToolbarView.js',
			
		),
		'styles' => array(
			'es/styles/es.SurfaceView.css',
			'es/styles/es.ContextView.css',
			'es/styles/es.ContentView.css',
			'es/styles/es.DocumentView.css',
			'es/styles/es.Inspector.css',
			'es/styles/es.ToolbarView.css',
			'es/styles/es.MenuView.css',
		),
		'dependencies' => array(
			'jquery',
		),
	)
);
