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

/* Configuration */

// URL to the parsoid instance
$wgVisualEditorParsoidURL = 'http://parsoid.wmflabs.org/';

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
			'ext.visualEditor.core',
		),
	),
	'ext.visualEditor.editPageInit' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			've2/init/targets/ve.init.ViewPageTarget.js',
		),
		'styles' => array(
			've2/init/styles/ve.init.ViewPageTarget.css',
			've2/init/styles/ve.init.ViewPageTarget-hd.css' => array(
				'media' => 'screen and (min-width: 982px)'
			),
		),
		'dependencies' => array(
			'ext.visualEditor.init',
			'mediawiki.util'
		),
		'messages' => array(
			'minoredit',
			'savearticle',
			'watchthis',
			'summary',
			'tooltip-save',
			'copyrightwarning',
			'copyrightpage',
			'edit',
			'accesskey-ca-edit',
			'tooltip-ca-edit',
			'viewsource'
		),
	),
	'ext.visualEditor.init' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			've2/init/ve.init.js',
			've2/init/ve.init.Target.js',
		),
		'dependencies' => array(
			'ext.visualEditor.base'
		),
	),
	'ext.visualEditor.base' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			// ve
			'jquery/jquery.json.js',
			've2/ve.js',
		)
	),
	'ext.visualEditor.core' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			// ve
			've2/ve.EventEmitter.js',
			've2/ve.Factory.js',
			've2/ve.Position.js',
			've2/ve.Range.js',
			've2/ve.Node.js',
			've2/ve.BranchNode.js',
			've2/ve.LeafNode.js',
			've2/ve.Surface.js',
			've2/ve.Document.js',

			// dm
			've2/dm/ve.dm.js',
			've2/dm/ve.dm.NodeFactory.js',
			've2/dm/ve.dm.AnnotationFactory.js',
			've2/dm/ve.dm.Node.js',
			've2/dm/ve.dm.BranchNode.js',
			've2/dm/ve.dm.LeafNode.js',
			've2/dm/ve.dm.Annotation.js',
			've2/dm/ve.dm.TransactionProcessor.js',
			've2/dm/ve.dm.Transaction.js',
			've2/dm/ve.dm.Surface.js',
			've2/dm/ve.dm.Document.js',
			've2/dm/ve.dm.DocumentSynchronizer.js',
			've2/dm/ve.dm.Converter.js',

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
			've2/dm/nodes/ve.dm.TableSectionNode.js',
			've2/dm/nodes/ve.dm.TextNode.js',

			've2/dm/annotations/ve.dm.LinkAnnotation.js',
			've2/dm/annotations/ve.dm.TextStyleAnnotation.js',

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
			've2/ce/nodes/ve.ce.TableSectionNode.js',
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
			// ce
			've2/ce/styles/ve.ce.Document.css',
			've2/ce/styles/ve.ce.Node.css',
			've2/ce/styles/ve.ce.Surface.css',
			// ui
			've2/ui/styles/ve.ui.Context.css',
			've2/ui/styles/ve.ui.Inspector.css',
			've2/ui/styles/ve.ui.Menu.css',
			've2/ui/styles/ve.ui.Surface.css',
			've2/ui/styles/ve.ui.Toolbar.css',
		),
		'dependencies' => array(
			'jquery',
			'rangy',
			'ext.visualEditor.base'
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

/*
 * VisualEditor Namespace
 * Using 2500 and 2501 as per registration on mediawiki.org
 *
 * @see http://www.mediawiki.org/wiki/Extension_default_namespaces
*/
define( 'NS_VISUALEDITOR', 2500 );
define( 'NS_VISUALEDITOR_TALK', 2501 );	
$wgExtraNamespaces[NS_VISUALEDITOR] = 'VisualEditor';
$wgExtraNamespaces[NS_VISUALEDITOR_TALK] = 'VisualEditor_talk';
$wgContentNamespaces[] = NS_VISUALEDITOR;
$wgContentNamespaces[] = NS_VISUALEDITOR_TALK;

// VE Namespace protection
$wgNamespaceProtection[NS_VISUALEDITOR] = array( 've-edit' );
$wgGroupPermissions['sysop']['ve-edit'] = true;

// Parsoid Wrapper API
$wgAutoloadClasses['ApiVisualEditor'] = $dir . 'ApiVisualEditor.php';
$wgAPIModules['ve-parsoid'] = 'ApiVisualEditor';

// Integration Hooks
$wgAutoloadClasses['VisualEditorHooks'] = $dir . 'VisualEditor.hooks.php';
$wgHooks['BeforePageDisplay'][] = 'VisualEditorHooks::onBeforePageDisplay';
$wgHooks['userCan'][] = 'VisualEditorHooks::onUserCan';
$wgHooks['MakeGlobalVariablesScript'][] = 'VisualEditorHooks::onMakeGlobalVariablesScript';
