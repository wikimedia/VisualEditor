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
			'jquery/jquery.json.js',
			've2/ve.js',
			've2/ve.NodeFactory.js',
			've2/ve.Position.js',
			've2/ve.Range.js',
			've2/ve.EventEmitter.js',
			've2/ve.Node.js',
			've2/ve.BranchNode.js',
			've2/ve.LeafNode.js',
			've2/ve.Surface.js',
			've2/ve.Document.js',

			// dm
			've2/dm/ve.dm.js',
			've2/dm/ve.dm.NodeFactory.js',
			've2/dm/ve.dm.Node.js',
			've2/dm/ve.dm.BranchNode.js',
			've2/dm/ve.dm.LeafNode.js',
			've2/dm/ve.dm.TransactionProcessor.js',
			've2/dm/ve.dm.Transaction.js',
			've2/dm/ve.dm.Surface.js',
			've2/dm/ve.dm.Document.js',
			've2/dm/ve.dm.HTMLConverter.js',

			've2/dm/nodes/ve.dm.AlienInlineNode.js',
			've2/dm/nodes/ve.dm.AlienBlockNode.js',
			've2/dm/nodes/ve.dm.DefinitionListItemNode.js',
			've2/dm/nodes/ve.dm.DefinitionListNode.js',
			've2/dm/nodes/ve.dm.DocumentNode.js',
			've2/dm/nodes/ve.dm.HeadingNode.js',
			've2/dm/nodes/ve.dm.ImageNode.js',
			've2/dm/nodes/ve.dm.ListItemNode.js',
			've2/dm/nodes/ve.dm.ListNode.js',
			've2/dm/nodes/ve.dm.ParagraphNode.js',
			've2/dm/nodes/ve.dm.PreformattedNode.js',
			've2/dm/nodes/ve.dm.TableCellNode.js',
			've2/dm/nodes/ve.dm.TableNode.js',
			've2/dm/nodes/ve.dm.TableRowNode.js',
			've2/dm/nodes/ve.dm.TextNode.js',

			've/dm/serializers/ve.dm.AnnotationSerializer.js',
			've/dm/serializers/ve.dm.HtmlSerializer.js',
			've/dm/serializers/ve.dm.JsonSerializer.js',
			've/dm/serializers/ve.dm.WikitextSerializer.js',

			// ce
			've2/ce/ve.ce.js',
			've2/ce/ve.ce.NodeFactory.js',
			've2/ce/ve.ce.Document.js',
			've2/ce/ve.ce.Node.js',
			've2/ce/ve.ce.BranchNode.js',
			've2/ce/ve.ce.LeafNode.js',
			've2/ce/ve.ce.Surface.js',

			've2/ce/nodes/ve.ce.AlienInlineNode.js',
			've2/ce/nodes/ve.ce.AlienBlockNode.js',
			've2/ce/nodes/ve.ce.DefinitionListItemNode.js',
			've2/ce/nodes/ve.ce.DefinitionListNode.js',
			've2/ce/nodes/ve.ce.DocumentNode.js',
			've2/ce/nodes/ve.ce.HeadingNode.js',
			've2/ce/nodes/ve.ce.ImageNode.js',
			've2/ce/nodes/ve.ce.ListItemNode.js',
			've2/ce/nodes/ve.ce.ListNode.js',
			've2/ce/nodes/ve.ce.ParagraphNode.js',
			've2/ce/nodes/ve.ce.PreformattedNode.js',
			've2/ce/nodes/ve.ce.TableCellNode.js',
			've2/ce/nodes/ve.ce.TableNode.js',
			've2/ce/nodes/ve.ce.TableRowNode.js',
			've2/ce/nodes/ve.ce.TextNode.js',

			// ui
			've2/ui/ve.ui.js',
			've2/ui/ve.ui.Inspector.js',
			've2/ui/ve.ui.Tool.js',
			've2/ui/ve.ui.Toolbar.js',
			've2/ui/ve.ui.Context.js',
			've2/ui/ve.ui.Menu.js',

			've2/ui/inspectors/ve.ui.LinkInspector.js',

			've2/ui/tools/ve.ui.ButtonTool.js',
			've2/ui/tools/ve.ui.AnnotationButtonTool.js',
			've2/ui/tools/ve.ui.ClearButtonTool.js',
			've2/ui/tools/ve.ui.HistoryButtonTool.js',
			've2/ui/tools/ve.ui.ListButtonTool.js',
			've2/ui/tools/ve.ui.IndentationButtonTool.js',
			've2/ui/tools/ve.ui.DropdownTool.js',
			've2/ui/tools/ve.ui.FormatDropdownTool.js'
		),
		'styles' => array(
			// es
			've/ce/styles/ve.ce.Surface.css',
			've/ce/styles/ve.ce.Content.css',
			've/ce/styles/ve.ce.Document.css',
			// ui
			've2/ui/styles/ve.ui.Context.css',
			've2/ui/styles/ve.ui.Inspector.css',
			've2/ui/styles/ve.ui.Toolbar.css',
			've2/ui/styles/ve.ui.Menu.css',
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
