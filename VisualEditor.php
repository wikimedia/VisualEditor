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
	'url' => 'https://www.mediawiki.org/wiki/Extension:VisualEditor',
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
	'rangy' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'rangy/rangy-core.js',
			'rangy/rangy-position.js',
		),
	),
	'ext.visualEditor.special.sandbox' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'sandbox/special.js',
		),
		'messages' => array(
			'visualeditor-feedback-prompt',
			'visualeditor-feedback-dialog-title',
			'visualeditor-sandbox-title',
		),
		'dependencies' => array( 
			'ext.visualEditor.sandbox',
			'mediawiki.feedback',
			'mediawiki.Uri',
		)
	),
	'ext.visualEditor.sandbox' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'sandbox/sandbox.js',
		),
		'messages' => array(
			'visualeditorsandbox',
		),
		'styles' => 'sandbox/sandbox.css',
		'dependencies' => array(
			'ext.visualEditor.ve',
		),
	),
	'ext.visualEditor.ve' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			// ve
			've/ve.js',
			've/ve.Position.js',
			've/ve.Range.js',
			've/ve.EventEmitter.js',
			've/ve.Node.js',
			've/ve.BranchNode.js',
			've/ve.LeafNode.js',
			// dm
			've/dm/ve.dm.js',
			've/dm/ve.dm.Node.js',
			've/dm/ve.dm.BranchNode.js',
			've/dm/ve.dm.LeafNode.js',
			've/dm/ve.dm.TransactionProcessor.js',
			've/dm/ve.dm.Transaction.js',
			've/dm/ve.dm.Surface.js',
			've/dm/nodes/ve.dm.DocumentNode.js',
			've/dm/nodes/ve.dm.HeadingNode.js',
			've/dm/nodes/ve.dm.ParagraphNode.js',
			've/dm/nodes/ve.dm.PreNode.js',
			've/dm/nodes/ve.dm.ListItemNode.js',
			've/dm/nodes/ve.dm.ListNode.js',
			've/dm/nodes/ve.dm.TableCellNode.js',
			've/dm/nodes/ve.dm.TableNode.js',
			've/dm/nodes/ve.dm.TableRowNode.js',
			've/dm/serializers/ve.dm.AnnotationSerializer.js',
			've/dm/serializers/ve.dm.HtmlSerializer.js',
			've/dm/serializers/ve.dm.JsonSerializer.js',
			've/dm/serializers/ve.dm.WikitextSerializer.js',
			// ce
			've/ce/ve.ce.js',
			've/ce/ve.ce.Node.js',
			've/ce/ve.ce.BranchNode.js',
			've/ce/ve.ce.LeafNode.js',
			've/ce/ve.ce.Content.js',
			've/ce/ve.ce.Surface.js',
			've/ce/ve.ce.SurfaceObserver.js',
			've/ce/nodes/ve.ce.DocumentNode.js',
			've/ce/nodes/ve.ce.HeadingNode.js',
			've/ce/nodes/ve.ce.ParagraphNode.js',
			've/ce/nodes/ve.ce.PreNode.js',
			've/ce/nodes/ve.ce.ListItemNode.js',
			've/ce/nodes/ve.ce.ListNode.js',
			've/ce/nodes/ve.ce.TableCellNode.js',
			've/ce/nodes/ve.ce.TableNode.js',
			've/ce/nodes/ve.ce.TableRowNode.js',
			// ui
			've/ui/ve.ui.js',
			've/ui/ve.ui.Inspector.js',
			've/ui/ve.ui.Tool.js',
			've/ui/ve.ui.Toolbar.js',
			've/ui/ve.ui.Context.js',
			've/ui/ve.ui.Menu.js',
			've/ui/inspectors/ve.ui.LinkInspector.js',
			've/ui/tools/ve.ui.ButtonTool.js',
			've/ui/tools/ve.ui.AnnotationButtonTool.js',
			've/ui/tools/ve.ui.ClearButtonTool.js',
			've/ui/tools/ve.ui.HistoryButtonTool.js',
			've/ui/tools/ve.ui.ListButtonTool.js',
			've/ui/tools/ve.ui.IndentationButtonTool.js',
			've/ui/tools/ve.ui.DropdownTool.js',
			've/ui/tools/ve.ui.FormatDropdownTool.js',
		),
		'styles' => array(
			// es
			've/ce/styles/ve.ce.Surface.css',
			've/ce/styles/ve.ce.Content.css',
			've/ce/styles/ve.ce.Document.css',
			// ui
			've/ui/styles/ve.ui.Context.css',
			've/ui/styles/ve.ui.Inspector.css',
			've/ui/styles/ve.ui.Toolbar.css',
			've/ui/styles/ve.ui.Menu.css',
		),
		'dependencies' => array(
			'jquery',
			'rangy',
		),
		'messages' => array(
			'visualeditor-tooltip-wikitext',
			'visualeditor-tooltip-json',
			'visualeditor-tooltip-html',
			'visualeditor-tooltip-render',
			'visualeditor-tooltip-history',
			'visualeditor-tooltip-help',
			'visualeditor',
		),
	)
);


// API for retrieving wikidom parse results
$wgAutoloadClasses['ApiQueryParseTree'] = $dir . 'api/ApiQueryParseTree.php';
$wgAPIPropModules['parsetree'] = 'ApiQueryParseTree';

// external cmd, accepts wikitext and returns parse tree in JSON. Also set environment variables needed by script here.
putenv('NODE_PATH=/usr/local/bin/node_modules' );
$wgVisualEditorParserCmd = '/usr/local/bin/node ' . $dir . 'modules/parser/parse.js';
