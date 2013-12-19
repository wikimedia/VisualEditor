<?php
/**
 * VisualEditor extension
 *
 * @file
 * @ingroup Extensions
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
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
		'Christian Williams',
		'Rob Moen',
		'Subramanya Sastry',
		'Timo Tijhof',
		'Ed Sanders',
		'David Chan',
		'Moriel Schottlender',
	),
	'version' => '0.1.0',
	'url' => 'https://www.mediawiki.org/wiki/Extension:VisualEditor',
	'descriptionmsg' => 'visualeditor-desc',
);

$dir = __DIR__ . '/';

// Register files
$wgAutoloadClasses['ApiVisualEditor'] = $dir . 'ApiVisualEditor.php';
$wgAutoloadClasses['ApiVisualEditorEdit'] = $dir . 'ApiVisualEditorEdit.php';
$wgAutoloadClasses['VisualEditorHooks'] = $dir . 'VisualEditor.hooks.php';
$wgAutoloadClasses['VisualEditorDataModule'] = $dir . 'VisualEditorDataModule.php';
$wgExtensionMessagesFiles['VisualEditor'] = $dir . 'VisualEditor.i18n.php';

// Register API modules
$wgAPIModules['visualeditor'] = 'ApiVisualEditor';
$wgAPIModules['visualeditoredit'] = 'ApiVisualEditorEdit';

// Register Hooks
$wgHooks['BeforePageDisplay'][] = 'VisualEditorHooks::onBeforePageDisplay';
$wgHooks['DoEditSectionLink'][] = 'VisualEditorHooks::onDoEditSectionLink';
if ( array_key_exists( 'GetBetaFeaturePreferences', $wgHooks ) ) {
	$wgHooks['GetBetaFeaturePreferences'][] = 'VisualEditorHooks::onGetBetaPreferences';
}
$wgHooks['GetPreferences'][] = 'VisualEditorHooks::onGetPreferences';
$wgHooks['ListDefinedTags'][] = 'VisualEditorHooks::onListDefinedTags';
$wgHooks['MakeGlobalVariablesScript'][] = 'VisualEditorHooks::onMakeGlobalVariablesScript';
$wgHooks['ResourceLoaderGetConfigVars'][] = 'VisualEditorHooks::onResourceLoaderGetConfigVars';
$wgHooks['ResourceLoaderRegisterModules'][] = 'VisualEditorHooks::onResourceLoaderRegisterModules';
$wgHooks['ResourceLoaderTestModules'][] = 'VisualEditorHooks::onResourceLoaderTestModules';
$wgHooks['SkinTemplateNavigation'][] = 'VisualEditorHooks::onSkinTemplateNavigation';
$wgHooks['ParserTestGlobals'][] = 'VisualEditorHooks::onParserTestGlobals';
$wgExtensionFunctions[] = 'VisualEditorHooks::onSetup';

// Set default values for new preferences
$wgDefaultUserOptions['visualeditor-enable'] = 0;
$wgDefaultUserOptions['visualeditor-enable-experimental'] = 0;
$wgDefaultUserOptions['visualeditor-enable-mwmath'] = 0;
$wgDefaultUserOptions['visualeditor-betatempdisable'] = 0;

// Register resource modules

$wgVisualEditorResourceTemplate = array(
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'VisualEditor',
);

$wgResourceModules += array(
	'rangy' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'lib/rangy/rangy-core-1.3.js',
			'lib/rangy/rangy-position-1.3.js',
			'lib/rangy/rangy-export.js',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),

	'jquery.visibleText' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'lib/jquery/jquery.visibleText.js',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),

	'unicodejs.wordbreak' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'modules/unicodejs/unicodejs.js',
			'modules/unicodejs/unicodejs.textstring.js',
			'modules/unicodejs/unicodejs.graphemebreakproperties.js',
			'modules/unicodejs/unicodejs.graphemebreak.js',
			'modules/unicodejs/unicodejs.wordbreakproperties.js',
			'modules/unicodejs/unicodejs.wordbreak.js',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),

	// Alias for backwards compat, safe to remove after
	'ext.visualEditor.editPageInit' => $wgVisualEditorResourceTemplate + array(
		'dependencies' => array(
			'ext.visualEditor.viewPageTarget',
		)
	),

	'ext.visualEditor.viewPageTarget.icons-raster' => $wgVisualEditorResourceTemplate + array(
		'styles' => array(
			'modules/ve-mw/init/styles/ve.init.mw.ViewPageTarget.Icons-raster.css',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),

	'ext.visualEditor.viewPageTarget.icons-vector' => $wgVisualEditorResourceTemplate + array(
		'styles' => array(
			'modules/ve-mw/init/styles/ve.init.mw.ViewPageTarget.Icons-vector.css',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),

	'ext.visualEditor.viewPageTarget.init' => $wgVisualEditorResourceTemplate + array(
		'scripts' => 'modules/ve-mw/init/targets/ve.init.mw.ViewPageTarget.init.js',
		'styles' => 'modules/ve-mw/init/styles/ve.init.mw.ViewPageTarget.init.css',
		'dependencies' => array(
			'jquery.client',
			'mediawiki.Title',
			'mediawiki.Uri',
			'mediawiki.util',
			'user.options',
		),
		'messages' => array(
			'accesskey-ca-editsource',
			'accesskey-ca-ve-edit',
			'pipe-separator',
			'tooltip-ca-createsource',
			'tooltip-ca-editsource',
			'tooltip-ca-ve-edit',
			'visualeditor-ca-editsource-section',
		),
		'position' => 'top',
	),

	'ext.visualEditor.viewPageTarget.noscript' => $wgVisualEditorResourceTemplate + array(
		'styles' => 'modules/ve-mw/init/styles/ve.init.mw.ViewPageTarget.noscript.css',
	),

	'ext.visualEditor.viewPageTarget' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'modules/ve-mw/init/targets/ve.init.mw.ViewPageTarget.js',
		),
		'styles' => array(
			'modules/ve-mw/init/styles/ve.init.mw.ViewPageTarget.css',
		),
		'skinStyles' => array(
			'vector' => array(
				'modules/ve-mw/init/styles/ve.init.mw.ViewPageTarget-vector.css',
				'modules/ve-mw/init/styles/ve.init.mw.ViewPageTarget-vector-hd.css' => array(
					'media' => 'screen and (min-width: 982px)'
				),
			),
			'apex' => array(
				'modules/ve-mw/init/styles/ve.init.mw.ViewPageTarget-apex.css',
			),
			'monobook' => array(
				'modules/ve-mw/init/styles/ve.init.mw.ViewPageTarget-monobook.css',
			)
		),
		'dependencies' => array(
			'ext.visualEditor.base',
			'ext.visualEditor.mediawiki',
			'jquery.placeholder',
			'mediawiki.feedback',
			'mediawiki.jqueryMsg',
			'mediawiki.util',
		),
		'messages' => array(
			// MW core messages
			'creating',
			'editing',
			'spamprotectionmatch',
			'spamprotectiontext',

			// Messages needed by VE in init phase only (rest go below)
			'visualeditor-loadwarning',
			'visualeditor-loadwarning-token',
			'visualeditor-notification-created',
			'visualeditor-notification-restored',
			'visualeditor-notification-saved',
			'visualeditor-savedialog-identify-anon',
			'visualeditor-savedialog-identify-user',
		),
	),
	'ext.visualEditor.mobileViewTarget' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'modules/ve-mw/init/targets/ve.init.mw.MobileViewTarget.js',
		),
		'dependencies' => array(
			'ext.visualEditor.base',
			'ext.visualEditor.mediawiki',
		),
		'targets' => array( 'mobile' ),
	),

	'ext.visualEditor.base' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			// ve
			'modules/ve/ve.js',
			'modules/ve/ve.track.js',

			// init
			'modules/ve/init/ve.init.js',
			'modules/ve/init/ve.init.Platform.js',
			'modules/ve/init/ve.init.Target.js',
		),
		'debugScripts' => array(
			'modules/ve/ve.debug.js',
		),
		'dependencies' => array(
			'oojs',
			'oojs-ui',
			'unicodejs.wordbreak',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),

	'ext.visualEditor.mediawiki' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			// init
			'modules/ve-mw/init/ve.init.mw.js',
			'modules/ve-mw/init/ve.init.mw.Platform.js',
			'modules/ve-mw/init/ve.init.mw.Target.js',
		),
		'dependencies' => array(
			'jquery.visibleText',
			'jquery.byteLength',
			'jquery.client',
			'mediawiki.Uri',
			'mediawiki.api',
			'mediawiki.notify',
			'mediawiki.Title',
			'mediawiki.Uri',
			'mediawiki.user',
			'mediawiki.util',
			'user.options',
			'user.tokens',
			'ext.visualEditor.base',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),

	'ext.visualEditor.standalone' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			// init
			'modules/ve/init/sa/ve.init.sa.js',
			'modules/ve/init/sa/ve.init.sa.Platform.js',
			'modules/ve/init/sa/ve.init.sa.Target.js',
		),
		'styles' => array(
			'modules/ve/init/sa/styles/ve.init.sa.css'
		),
		'dependencies' => array(
			'ext.visualEditor.base',
			'jquery.i18n',
		),
	),

	'ext.visualEditor.data' => $wgVisualEditorResourceTemplate + array(
		'class' => 'VisualEditorDataModule',
	),

	'ext.visualEditor.core' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			// ve
			'modules/ve/ve.Range.js',
			'modules/ve/ve.Node.js',
			'modules/ve/ve.BranchNode.js',
			'modules/ve/ve.LeafNode.js',
			'modules/ve/ve.Document.js',
			'modules/ve/ve.EventSequencer.js',

			// dm
			'modules/ve/dm/ve.dm.js',
			'modules/ve/dm/ve.dm.Model.js',
			'modules/ve/dm/ve.dm.ModelRegistry.js',
			'modules/ve/dm/ve.dm.NodeFactory.js',
			'modules/ve/dm/ve.dm.AnnotationFactory.js',
			'modules/ve/dm/ve.dm.AnnotationSet.js',
			'modules/ve/dm/ve.dm.MetaItemFactory.js',
			'modules/ve/dm/ve.dm.Node.js',
			'modules/ve/dm/ve.dm.BranchNode.js',
			'modules/ve/dm/ve.dm.LeafNode.js',
			'modules/ve/dm/ve.dm.Annotation.js',
			'modules/ve/dm/ve.dm.InternalList.js',
			'modules/ve/dm/ve.dm.MetaItem.js',
			'modules/ve/dm/ve.dm.MetaList.js',
			'modules/ve/dm/ve.dm.TransactionProcessor.js',
			'modules/ve/dm/ve.dm.Transaction.js',
			'modules/ve/dm/ve.dm.Surface.js',
			'modules/ve/dm/ve.dm.SurfaceFragment.js',
			'modules/ve/dm/ve.dm.DataString.js',
			'modules/ve/dm/ve.dm.Document.js',
			'modules/ve/dm/ve.dm.DocumentSlice.js',
			'modules/ve/dm/ve.dm.LinearData.js',
			'modules/ve/dm/ve.dm.DocumentSynchronizer.js',
			'modules/ve/dm/ve.dm.IndexValueStore.js',
			'modules/ve/dm/ve.dm.Converter.js',

			'modules/ve/dm/lineardata/ve.dm.FlatLinearData.js',
			'modules/ve/dm/lineardata/ve.dm.ElementLinearData.js',
			'modules/ve/dm/lineardata/ve.dm.MetaLinearData.js',

			'modules/ve/dm/nodes/ve.dm.GeneratedContentNode.js',
			'modules/ve/dm/nodes/ve.dm.AlienNode.js',
			'modules/ve/dm/nodes/ve.dm.BreakNode.js',
			'modules/ve/dm/nodes/ve.dm.CenterNode.js',
			'modules/ve/dm/nodes/ve.dm.DefinitionListItemNode.js',
			'modules/ve/dm/nodes/ve.dm.DefinitionListNode.js',
			'modules/ve/dm/nodes/ve.dm.DivNode.js',
			'modules/ve/dm/nodes/ve.dm.DocumentNode.js',
			'modules/ve/dm/nodes/ve.dm.HeadingNode.js',
			'modules/ve/dm/nodes/ve.dm.ImageNode.js',
			'modules/ve/dm/nodes/ve.dm.InternalItemNode.js',
			'modules/ve/dm/nodes/ve.dm.InternalListNode.js',
			'modules/ve/dm/nodes/ve.dm.ListItemNode.js',
			'modules/ve/dm/nodes/ve.dm.ListNode.js',
			'modules/ve/dm/nodes/ve.dm.ParagraphNode.js',
			'modules/ve/dm/nodes/ve.dm.PreformattedNode.js',
			'modules/ve/dm/nodes/ve.dm.TableCaptionNode.js',
			'modules/ve/dm/nodes/ve.dm.TableCellNode.js',
			'modules/ve/dm/nodes/ve.dm.TableNode.js',
			'modules/ve/dm/nodes/ve.dm.TableRowNode.js',
			'modules/ve/dm/nodes/ve.dm.TableSectionNode.js',
			'modules/ve/dm/nodes/ve.dm.TextNode.js',

			'modules/ve/dm/annotations/ve.dm.LinkAnnotation.js',
			'modules/ve/dm/annotations/ve.dm.TextStyleAnnotation.js',

			'modules/ve/dm/metaitems/ve.dm.AlienMetaItem.js',

			// ce
			'modules/ve/ce/ve.ce.js',
			'modules/ve/ce/ve.ce.DomRange.js',
			'modules/ve/ce/ve.ce.AnnotationFactory.js',
			'modules/ve/ce/ve.ce.NodeFactory.js',
			'modules/ve/ce/ve.ce.Document.js',
			'modules/ve/ce/ve.ce.View.js',
			'modules/ve/ce/ve.ce.Annotation.js',
			'modules/ve/ce/ve.ce.Node.js',
			'modules/ve/ce/ve.ce.BranchNode.js',
			'modules/ve/ce/ve.ce.ContentBranchNode.js',
			'modules/ve/ce/ve.ce.LeafNode.js',
			'modules/ve/ce/ve.ce.ProtectedNode.js',
			'modules/ve/ce/ve.ce.FocusableNode.js',
			'modules/ve/ce/ve.ce.RelocatableNode.js',
			'modules/ve/ce/ve.ce.ResizableNode.js',
			'modules/ve/ce/ve.ce.Surface.js',
			'modules/ve/ce/ve.ce.SurfaceObserver.js',

			'modules/ve/ce/nodes/ve.ce.GeneratedContentNode.js',
			'modules/ve/ce/nodes/ve.ce.AlienNode.js',
			'modules/ve/ce/nodes/ve.ce.BreakNode.js',
			'modules/ve/ce/nodes/ve.ce.CenterNode.js',
			'modules/ve/ce/nodes/ve.ce.DefinitionListItemNode.js',
			'modules/ve/ce/nodes/ve.ce.DefinitionListNode.js',
			'modules/ve/ce/nodes/ve.ce.DivNode.js',
			'modules/ve/ce/nodes/ve.ce.DocumentNode.js',
			'modules/ve/ce/nodes/ve.ce.HeadingNode.js',
			'modules/ve/ce/nodes/ve.ce.ImageNode.js',
			'modules/ve/ce/nodes/ve.ce.InternalItemNode.js',
			'modules/ve/ce/nodes/ve.ce.InternalListNode.js',
			'modules/ve/ce/nodes/ve.ce.ListItemNode.js',
			'modules/ve/ce/nodes/ve.ce.ListNode.js',
			'modules/ve/ce/nodes/ve.ce.ParagraphNode.js',
			'modules/ve/ce/nodes/ve.ce.PreformattedNode.js',
			'modules/ve/ce/nodes/ve.ce.TableCaptionNode.js',
			'modules/ve/ce/nodes/ve.ce.TableCellNode.js',
			'modules/ve/ce/nodes/ve.ce.TableNode.js',
			'modules/ve/ce/nodes/ve.ce.TableRowNode.js',
			'modules/ve/ce/nodes/ve.ce.TableSectionNode.js',
			'modules/ve/ce/nodes/ve.ce.TextNode.js',

			'modules/ve/ce/annotations/ve.ce.LinkAnnotation.js',
			'modules/ve/ce/annotations/ve.ce.TextStyleAnnotation.js',

			// ui
			'modules/ve/ui/ve.ui.js',

			'modules/ve/ui/ve.ui.Surface.js',
			'modules/ve/ui/ve.ui.Context.js',
			'modules/ve/ui/ve.ui.Dialog.js',
			'modules/ve/ui/ve.ui.Inspector.js',
			'modules/ve/ui/ve.ui.WindowSet.js',
			'modules/ve/ui/ve.ui.Toolbar.js',
			'modules/ve/ui/ve.ui.TargetToolbar.js',
			'modules/ve/ui/ve.ui.ToolFactory.js',
			'modules/ve/ui/ve.ui.Command.js',
			'modules/ve/ui/ve.ui.CommandRegistry.js',
			'modules/ve/ui/ve.ui.Trigger.js',
			'modules/ve/ui/ve.ui.TriggerRegistry.js',
			'modules/ve/ui/ve.ui.Action.js',
			'modules/ve/ui/ve.ui.ActionFactory.js',

			'modules/ve/ui/actions/ve.ui.AnnotationAction.js',
			'modules/ve/ui/actions/ve.ui.ContentAction.js',
			'modules/ve/ui/actions/ve.ui.DialogAction.js',
			'modules/ve/ui/actions/ve.ui.FormatAction.js',
			'modules/ve/ui/actions/ve.ui.HistoryAction.js',
			'modules/ve/ui/actions/ve.ui.IndentationAction.js',
			'modules/ve/ui/actions/ve.ui.InspectorAction.js',
			'modules/ve/ui/actions/ve.ui.ListAction.js',

			'modules/ve/ui/widgets/ve.ui.SurfaceWidget.js',
			'modules/ve/ui/widgets/ve.ui.LinkTargetInputWidget.js',

			'modules/ve/ui/tools/ve.ui.AnnotationTool.js',
			'modules/ve/ui/tools/ve.ui.ClearAnnotationTool.js',
			'modules/ve/ui/tools/ve.ui.DialogTool.js',
			'modules/ve/ui/tools/ve.ui.FormatTool.js',
			'modules/ve/ui/tools/ve.ui.HistoryTool.js',
			'modules/ve/ui/tools/ve.ui.IndentationTool.js',
			'modules/ve/ui/tools/ve.ui.InspectorTool.js',
			'modules/ve/ui/tools/ve.ui.ListTool.js',

			'modules/ve/ui/inspectors/ve.ui.AnnotationInspector.js',
			'modules/ve/ui/inspectors/ve.ui.LinkInspector.js',

			'modules/ve/ui/widgets/ve.ui.GroupButtonWidget.js',
			'modules/ve/ui/inspectors/ve.ui.SpecialCharacterInspector.js',
		),
		'styles' => array(
			// ce
			'modules/ve/ce/styles/ve.ce.Node.css',
			'modules/ve/ce/styles/ve.ce.Surface.css',
			// ui
			'modules/ve/ui/styles/ve.ui.Context.css',
			'modules/ve/ui/styles/ve.ui.Inspector.css',
			'modules/ve/ui/styles/ve.ui.Surface.css',
			'modules/ve/ui/styles/ve.ui.Tool.css',
			'modules/ve/ui/styles/ve.ui.Toolbar.css',
			'modules/ve/ui/styles/ve.ui.Widget.css',
		),
		'dependencies' => array(
			'rangy',
			'unicodejs.wordbreak',
			'ext.visualEditor.base',
		),
		'messages' => array(
			'visualeditor',
			'visualeditor-aliennode-tooltip',
			'visualeditor-annotationbutton-bold-tooltip',
			'visualeditor-annotationbutton-code-tooltip',
			'visualeditor-annotationbutton-italic-tooltip',
			'visualeditor-annotationbutton-link-tooltip',
			'visualeditor-annotationbutton-strikethrough-tooltip',
			'visualeditor-annotationbutton-subscript-tooltip',
			'visualeditor-annotationbutton-superscript-tooltip',
			'visualeditor-annotationbutton-underline-tooltip',
			'visualeditor-clearbutton-tooltip',
			'visualeditor-dialog-action-apply',
			'visualeditor-dialog-action-cancel',
			'visualeditor-dialog-action-goback',
			'visualeditor-formatdropdown-format-heading1',
			'visualeditor-formatdropdown-format-heading2',
			'visualeditor-formatdropdown-format-heading3',
			'visualeditor-formatdropdown-format-heading4',
			'visualeditor-formatdropdown-format-heading5',
			'visualeditor-formatdropdown-format-heading6',
			'visualeditor-formatdropdown-format-paragraph',
			'visualeditor-formatdropdown-format-preformatted',
			'visualeditor-formatdropdown-title',
			'visualeditor-help-tool',
			'visualeditor-historybutton-redo-tooltip',
			'visualeditor-historybutton-undo-tooltip',
			'visualeditor-indentationbutton-indent-tooltip',
			'visualeditor-indentationbutton-outdent-tooltip',
			'visualeditor-inspector-close-tooltip',
			'visualeditor-inspector-remove-tooltip',
			'visualeditor-linkinspector-title',
			'visualeditor-listbutton-bullet-tooltip',
			'visualeditor-listbutton-number-tooltip',
			'visualeditor-specialcharacter-button-tooltip',
			'visualeditor-specialcharacterinspector-title',
			'visualeditor-specialcharinspector-characterlist-insert',
			'visualeditor-version-label',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),

	'ext.visualEditor.mwcore' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			// dm
			'modules/ve-mw/dm/nodes/ve.dm.MWEntityNode.js',
			'modules/ve-mw/dm/nodes/ve.dm.MWHeadingNode.js',
			'modules/ve-mw/dm/nodes/ve.dm.MWPreformattedNode.js',
			'modules/ve-mw/dm/nodes/ve.dm.MWImageNode.js',
			'modules/ve-mw/dm/nodes/ve.dm.MWInlineImageNode.js',
			'modules/ve-mw/dm/nodes/ve.dm.MWBlockImageNode.js',
			'modules/ve-mw/dm/nodes/ve.dm.MWImageCaptionNode.js',
			'modules/ve-mw/dm/nodes/ve.dm.MWNumberedExternalLinkNode.js',
			'modules/ve-mw/dm/nodes/ve.dm.MWTransclusionNode.js',
			'modules/ve-mw/dm/nodes/ve.dm.MWReferenceListNode.js',
			'modules/ve-mw/dm/nodes/ve.dm.MWReferenceNode.js',
			'modules/ve-mw/dm/nodes/ve.dm.MWExtensionNode.js',

			'modules/ve-mw/dm/annotations/ve.dm.MWExternalLinkAnnotation.js',
			'modules/ve-mw/dm/annotations/ve.dm.MWInternalLinkAnnotation.js',
			'modules/ve-mw/dm/annotations/ve.dm.MWNowikiAnnotation.js',

			'modules/ve-mw/dm/metaitems/ve.dm.MWAlienMetaItem.js',
			'modules/ve-mw/dm/metaitems/ve.dm.MWCategoryMetaItem.js',
			'modules/ve-mw/dm/metaitems/ve.dm.MWDefaultSortMetaItem.js',
			'modules/ve-mw/dm/metaitems/ve.dm.MWLanguageMetaItem.js',
			'modules/ve-mw/dm/metaitems/ve.dm.MWTransclusionMetaItem.js',

			'modules/ve-mw/dm/models/ve.dm.MWTransclusionModel.js',
			'modules/ve-mw/dm/models/ve.dm.MWTransclusionPartModel.js',
			'modules/ve-mw/dm/models/ve.dm.MWTransclusionContentModel.js',
			'modules/ve-mw/dm/models/ve.dm.MWTemplateSpecModel.js',
			'modules/ve-mw/dm/models/ve.dm.MWTemplateModel.js',
			'modules/ve-mw/dm/models/ve.dm.MWTemplatePlaceholderModel.js',
			'modules/ve-mw/dm/models/ve.dm.MWTemplateParameterModel.js',

			// ce
			'modules/ve-mw/ce/ve.ce.MWResizableNode.js',

			'modules/ve-mw/ce/nodes/ve.ce.MWEntityNode.js',
			'modules/ve-mw/ce/nodes/ve.ce.MWHeadingNode.js',
			'modules/ve-mw/ce/nodes/ve.ce.MWPreformattedNode.js',
			'modules/ve-mw/ce/nodes/ve.ce.MWImageNode.js',
			'modules/ve-mw/ce/nodes/ve.ce.MWInlineImageNode.js',
			'modules/ve-mw/ce/nodes/ve.ce.MWBlockImageNode.js',
			'modules/ve-mw/ce/nodes/ve.ce.MWImageCaptionNode.js',
			'modules/ve-mw/ce/nodes/ve.ce.MWNumberedExternalLinkNode.js',
			'modules/ve-mw/ce/nodes/ve.ce.MWTransclusionNode.js',
			'modules/ve-mw/ce/nodes/ve.ce.MWReferenceListNode.js',
			'modules/ve-mw/ce/nodes/ve.ce.MWReferenceNode.js',
			'modules/ve-mw/ce/nodes/ve.ce.MWExtensionNode.js',

			'modules/ve-mw/ce/annotations/ve.ce.MWExternalLinkAnnotation.js',
			'modules/ve-mw/ce/annotations/ve.ce.MWInternalLinkAnnotation.js',
			'modules/ve-mw/ce/annotations/ve.ce.MWNowikiAnnotation.js',

			// ui
			'modules/ve-mw/ui/ve.ui.MWDialog.js',

			'modules/ve-mw/ui/widgets/ve.ui.MWLinkTargetInputWidget.js',
			'modules/ve-mw/ui/widgets/ve.ui.MWCategoryInputWidget.js',
			'modules/ve-mw/ui/widgets/ve.ui.MWCategoryPopupWidget.js',
			'modules/ve-mw/ui/widgets/ve.ui.MWCategoryItemWidget.js',
			'modules/ve-mw/ui/widgets/ve.ui.MWCategoryWidget.js',
			'modules/ve-mw/ui/widgets/ve.ui.MWMediaSearchWidget.js',
			'modules/ve-mw/ui/widgets/ve.ui.MWMediaResultWidget.js',
			'modules/ve-mw/ui/widgets/ve.ui.MWParameterSearchWidget.js',
			'modules/ve-mw/ui/widgets/ve.ui.MWParameterResultWidget.js',
			'modules/ve-mw/ui/widgets/ve.ui.MWReferenceSearchWidget.js',
			'modules/ve-mw/ui/widgets/ve.ui.MWReferenceResultWidget.js',
			'modules/ve-mw/ui/widgets/ve.ui.MWTitleInputWidget.js',

			'modules/ve-mw/ui/pages/ve.ui.MWCategoriesPage.js',
			'modules/ve-mw/ui/pages/ve.ui.MWLanguagesPage.js',
			'modules/ve-mw/ui/pages/ve.ui.MWTemplatePage.js',
			'modules/ve-mw/ui/pages/ve.ui.MWTemplateParameterPage.js',
			'modules/ve-mw/ui/pages/ve.ui.MWTemplatePlaceholderPage.js',
			'modules/ve-mw/ui/pages/ve.ui.MWTransclusionContentPage.js',

			'modules/ve-mw/ui/dialogs/ve.ui.MWSaveDialog.js',
			'modules/ve-mw/ui/dialogs/ve.ui.MWMetaDialog.js',
			'modules/ve-mw/ui/dialogs/ve.ui.MWBetaWelcomeDialog.js',
			'modules/ve-mw/ui/dialogs/ve.ui.MWMediaInsertDialog.js',
			'modules/ve-mw/ui/dialogs/ve.ui.MWMediaEditDialog.js',
			'modules/ve-mw/ui/dialogs/ve.ui.MWTransclusionDialog.js',
			'modules/ve-mw/ui/dialogs/ve.ui.MWTemplateDialog.js',
			'modules/ve-mw/ui/dialogs/ve.ui.MWAdvancedTransclusionDialog.js',
			'modules/ve-mw/ui/dialogs/ve.ui.MWReferenceListDialog.js',
			'modules/ve-mw/ui/dialogs/ve.ui.MWReferenceDialog.js',

			'modules/ve-mw/ui/tools/ve.ui.MWEditModeTool.js',
			'modules/ve-mw/ui/tools/ve.ui.MWFormatTool.js',
			'modules/ve-mw/ui/tools/ve.ui.MWDialogTool.js',
			'modules/ve-mw/ui/tools/ve.ui.MWPopupTool.js',
			'modules/ve-mw/ui/tools/ve.ui.MWInspectorTool.js',

			'modules/ve-mw/ui/inspectors/ve.ui.MWLinkInspector.js',
			'modules/ve-mw/ui/inspectors/ve.ui.MWExtensionInspector.js',
		),
		'styles' => array(
			// ce
			'modules/ve-mw/ce/styles/ve.ce.Node.css',
			// ui
			'modules/ve-mw/ui/styles/ve.ui.MWWidget.css',
			'modules/ve-mw/ui/styles/ve.ui.MWInspector.css',
			'modules/ve-mw/ui/styles/ve.ui.MWDialog.css',
		),
		'dependencies' => array(
			'ext.visualEditor.core',
			'mediawiki.Title',
			'mediawiki.action.history.diff',
			'mediawiki.user',
			'mediawiki.util',
			'jquery.autoEllipsis',
			'jquery.byteLimit',
		),
		'messages' => array(
			'visualeditor-beta-label',
			'visualeditor-beta-warning',
			'visualeditor-browserwarning',
			'visualeditor-categories-tool',
			'visualeditor-dialog-beta-welcome-action-continue',
			'visualeditor-dialog-beta-welcome-content',
			'visualeditor-dialog-beta-welcome-title',
			'visualeditor-dialog-media-content-section',
			'visualeditor-dialog-media-insert-button',
			'visualeditor-dialog-media-insert-title',
			'visualeditor-dialog-media-title',
			'visualeditor-dialog-meta-categories-category',
			'visualeditor-dialog-meta-categories-data-label',
			'visualeditor-dialog-meta-categories-defaultsort-label',
			'visualeditor-dialog-meta-categories-input-matchingcategorieslabel',
			'visualeditor-dialog-meta-categories-input-movecategorylabel',
			'visualeditor-dialog-meta-categories-input-newcategorylabel',
			'visualeditor-dialog-meta-categories-input-placeholder',
			'visualeditor-dialog-meta-categories-options',
			'visualeditor-dialog-meta-categories-section',
			'visualeditor-dialog-meta-categories-sortkey-label',
			'visualeditor-dialog-meta-languages-code-label',
			'visualeditor-dialog-meta-languages-label',
			'visualeditor-dialog-meta-languages-link-label',
			'visualeditor-dialog-meta-languages-name-label',
			'visualeditor-dialog-meta-languages-readonlynote',
			'visualeditor-dialog-meta-languages-section',
			'visualeditor-dialog-meta-title',
			'visualeditor-dialog-reference-insert-button',
			'visualeditor-dialog-reference-insert-title',
			'visualeditor-dialog-reference-options-group-label',
			'visualeditor-dialog-reference-options-name-label',
			'visualeditor-dialog-reference-options-section',
			'visualeditor-dialog-reference-title',
			'visualeditor-dialog-reference-useexisting-label',
			'visualeditor-dialog-referencelist-title',
			'visualeditor-dialog-transclusion-add-content',
			'visualeditor-dialog-transclusion-add-param',
			'visualeditor-dialog-transclusion-add-template',
			'visualeditor-dialog-transclusion-content',
			'visualeditor-dialog-transclusion-options',
			'visualeditor-dialog-transclusion-placeholder',
			'visualeditor-dialog-transclusion-remove-content',
			'visualeditor-dialog-transclusion-remove-param',
			'visualeditor-dialog-transclusion-remove-template',
			'visualeditor-dialog-transclusion-title',
			'visualeditor-dialog-transclusion-wikitext-label',
			'visualeditor-dialogbutton-media-tooltip',
			'visualeditor-dialogbutton-meta-tooltip',
			'visualeditor-dialogbutton-reference-tooltip',
			'visualeditor-dialogbutton-referencelist-tooltip',
			'visualeditor-dialogbutton-transclusion-tooltip',
			'visualeditor-diff-nochanges',
			'visualeditor-differror',
			'visualeditor-editconflict',
			'visualeditor-editnotices-tool',
			'visualeditor-editsummary',
			'visualeditor-feedback-tool',
			'visualeditor-formatdropdown-format-mw-heading1',
			'visualeditor-formatdropdown-format-mw-heading2',
			'visualeditor-formatdropdown-format-mw-heading3',
			'visualeditor-formatdropdown-format-mw-heading4',
			'visualeditor-formatdropdown-format-mw-heading5',
			'visualeditor-formatdropdown-format-mw-heading6',
			'visualeditor-help-label',
			'visualeditor-help-link',
			'visualeditor-help-title',
			'visualeditor-languages-tool',
			'visualeditor-linkinspector-illegal-title',
			'visualeditor-linkinspector-suggest-external-link',
			'visualeditor-linkinspector-suggest-matching-page',
			'visualeditor-linkinspector-suggest-new-page',
			'visualeditor-media-input-placeholder',
			'visualeditor-meta-tool',
			'visualeditor-mweditmodesource-title',
			'visualeditor-mweditmodesource-warning',
			'visualeditor-parameter-input-placeholder',
			'visualeditor-parameter-search-no-unused',
			'visualeditor-parameter-search-unknown',
			'visualeditor-reference-input-placeholder',
			'visualeditor-referencelist-isempty',
			'visualeditor-referencelist-isempty-default',
			'visualeditor-referencelist-missingref',
			'visualeditor-savedialog-error-badtoken',
			'visualeditor-savedialog-label-create',
			'visualeditor-savedialog-label-error',
			'visualeditor-savedialog-label-report',
			'visualeditor-savedialog-label-resolve-conflict',
			'visualeditor-savedialog-label-restore',
			'visualeditor-savedialog-label-review',
			'visualeditor-savedialog-label-review-good',
			'visualeditor-savedialog-label-save',
			'visualeditor-savedialog-label-warning',
			'visualeditor-savedialog-title-conflict',
			'visualeditor-savedialog-title-nochanges',
			'visualeditor-savedialog-title-review',
			'visualeditor-savedialog-title-save',
			'visualeditor-savedialog-warning-dirty',
			'visualeditor-saveerror',
			'visualeditor-serializeerror',
			'visualeditor-toolbar-cancel',
			'visualeditor-toolbar-insert',
			'visualeditor-toolbar-savedialog',
			'visualeditor-viewpage-savewarning',
			'visualeditor-wikitext-warning-title',
			'visualeditor-window-title',

			// Only used if FancyCaptcha is installed and triggered on save
			'captcha-label',
			'fancycaptcha-edit',
			'colon-separator',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),

	'ext.visualEditor.language' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'modules/ve/dm/annotations/ve.dm.LanguageAnnotation.js',
			'modules/ve/ce/annotations/ve.ce.LanguageAnnotation.js',
			'modules/ve/ui/inspectors/ve.ui.LanguageInspector.js',
			'modules/ve/ui/tools/ve.ui.LanguageInspectorTool.js',
			'modules/ve/ui/widgets/ve.ui.LanguageInputWidget.js',
		),
		'dependencies' => array(
			'ext.visualEditor.core',
			'jquery.uls',
		),
		'messages' => array(
			'visualeditor-languageinspector-title',
			'visualeditor-languageinspector-block-tooltip',
			'visualeditor-languageinspector-block-tooltip-rtldirection',
			'visualeditor-languageinspector-widget-changelang',
			'visualeditor-languageinspector-widget-label-language',
			'visualeditor-languageinspector-widget-label-langcode',
			'visualeditor-languageinspector-widget-label-direction',
			'visualeditor-annotationbutton-language-tooltip',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),

	'ext.visualEditor.mwalienextension' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'modules/ve-mw/dm/nodes/ve.dm.MWAlienExtensionNode.js',
			'modules/ve-mw/ce/nodes/ve.ce.MWAlienExtensionNode.js',
			'modules/ve-mw/ui/inspectors/ve.ui.MWAlienExtensionInspector.js',
			'modules/ve-mw/ui/tools/ve.ui.MWAlienExtensionInspectorTool.js',
		),
		'dependencies' => array(
			'ext.visualEditor.mwcore',
		),
		'messages' => array(
			'visualeditor-mwalienextensioninspector-title',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),

	'ext.visualEditor.mwmath' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'modules/ve-mw/dm/nodes/ve.dm.MWMathNode.js',
			'modules/ve-mw/ce/nodes/ve.ce.MWMathNode.js',
			'modules/ve-mw/ui/inspectors/ve.ui.MWMathInspector.js',
			'modules/ve-mw/ui/tools/ve.ui.MWMathInspectorTool.js',
		),
		'dependencies' => array(
			'ext.visualEditor.mwcore',
		),
		'messages' => array(
			'visualeditor-mwmathinspector-title',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),

	'ext.visualEditor.mwhiero' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'modules/ve-mw/dm/nodes/ve.dm.MWHieroNode.js',
			'modules/ve-mw/ce/nodes/ve.ce.MWHieroNode.js',
			'modules/ve-mw/ui/inspectors/ve.ui.MWHieroInspector.js',
			'modules/ve-mw/ui/tools/ve.ui.MWHieroInspectorTool.js',
		),
		'dependencies' => array(
			'ext.visualEditor.mwcore',
		),
		'messages' => array(
			'visualeditor-mwhieroinspector-title',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),

	'ext.visualEditor.mwsyntaxHighlight' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'modules/syntaxhighlight/ve.dm.MWSyntaxHighlightNode.js',
			'modules/syntaxhighlight/ve.ce.MWSyntaxHighlightNode.js',
			'modules/syntaxhighlight/ve.ui.MWSyntaxHighlightTool.js',
			'modules/syntaxhighlight/ve.ui.MWSyntaxHighlightDialog.js',
			'modules/syntaxhighlight/ve.ui.MWSyntaxHighlightSimpleSurface.js',
			'modules/syntaxhighlight/helpers/ve.ce.MWSyntaxHighlightHighlighter.js',
			'modules/syntaxhighlight/helpers/ve.dm.MWSyntaxHighlightTokenizer.js',
			'modules/syntaxhighlight/helpers/ve.ce.MWSyntaxHighlightValidator.js',
		),
		'dependencies' => array(
			'ext.visualEditor.mwcore',
		),
		'messages' => array(
			'visualeditor-dialog-syntaxhighlight-title',
			'visualeditor-dialogbutton-syntaxhighlight-tooltip',
		),
		'styles' => array(
			'syntaxhighlight/styles/ve.ui.MWSyntaxHighlight.css',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),

	'ext.visualEditor.experimental' => array(
		'dependencies' => array(
			'ext.visualEditor.mwmath',
			'ext.visualEditor.mwhiero',
			'ext.visualEditor.language',
			'ext.visualEditor.mwalienextension',
			//'ext.visualEditor.mwsyntaxHighlight',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),

	'ext.visualEditor.icons-raster' => $wgVisualEditorResourceTemplate + array(
		'styles' => array(
			'modules/ve/ui/styles/ve.ui.Icons-raster.css',
			'modules/ve-mw/ui/styles/ve.ui.Icons-raster.css',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),
	'ext.visualEditor.icons-vector' => $wgVisualEditorResourceTemplate + array(
		'styles' => array(
			'modules/ve/ui/styles/ve.ui.Icons-vector.css',
			'modules/ve-mw/ui/styles/ve.ui.Icons-vector.css',
		),
		'targets' => array( 'desktop', 'mobile' ),
	),
);


/* Configuration */

// Array of ResourceLoader module names (strings) that should be loaded when VisualEditor is
// loaded. Other extensions that extend VisualEditor should add to this array.
$wgVisualEditorPluginModules = array();

// URL to the Parsoid instance
// MUST NOT end in a slash due to Parsoid bug
$wgVisualEditorParsoidURL = 'http://localhost:8000';

// Interwiki prefix to pass to the Parsoid instance
// Parsoid will be called as $url/$prefix/$pagename
$wgVisualEditorParsoidPrefix = 'localhost';

// Forward users' Cookie: headers to Parsoid. Required for private wikis (login required to read).
// If the wiki is not private (i.e. $wgGroupPermissions['*']['read'] is true) this configuration
// variable will be ignored.
//
// This feature requires a non-locking session store. The default session store will not work and
// will cause deadlocks when trying to use this feature. If you experience deadlock issues, enable
// $wgSessionsInObjectCache.
//
// WARNING: ONLY enable this on private wikis and ONLY IF you understand the SECURITY IMPLICATIONS
// of sending Cookie headers to Parsoid over HTTP. For security reasons, it is strongly recommended
// that $wgVisualEditorParsoidURL be pointed to localhost if this setting is enabled.
$wgVisualEditorParsoidForwardCookies = false;

// Timeout for HTTP requests to Parsoid in seconds
$wgVisualEditorParsoidTimeout = 100;

// Serialization cache timeout, in seconds
$wgVisualEditorSerializationCacheTimeout = 3600;

// Namespaces to enable VisualEditor in
$wgVisualEditorNamespaces = $wgContentNamespaces;

// List of skins VisualEditor integration supports
$wgVisualEditorSupportedSkins = array( 'vector', 'apex', 'monobook' );

// List of browsers VisualEditor is incompatibe with
// See jQuery.client for specification
$wgVisualEditorBrowserBlacklist = array(
	// IE <= 8 has various incompatibilities in layout and feature support
	// IE9 and IE10 generally work but fail in ajax handling when making POST
	// requests to the VisualEditor/Parsoid API which is causing silent failures
	// when trying to save a page (bug 49187)
	// Also, IE11 doesn't work either right now
	'msie' => null,
	// Android 2.x and below "support" CE but don't trigger keyboard input
	'android' => array( array( '<', 3 ) ),
	// Firefox issues in versions 12 and below (bug 50780)
	// Wikilink [[./]] bug in Firefox 14 and below (bug 50720)
	'firefox' => array( array( '<=', 14 ) ),
	// Opera < 12 was not tested and it's userbase is almost nonexistent anyway
	'opera' => array( array( '<', 12 ) ),
	// Blacklist all versions:
	'blackberry' => null,
);

// Whether to use change tagging for VisualEditor edits
$wgVisualEditorUseChangeTagging = true;

// Whether to disable for logged-in users
// This allows you to enable the 'visualeditor-enable' preference by default
// but still disable VE for logged-out users (by setting this to false).
$wgVisualEditorDisableForAnons = false;

// Whether to show the "welcome to the beta" dialog the first time a user uses VisualEditor
$wgVisualEditorShowBetaWelcome = false;

// Where to put the VisualEditor edit tab
// 'before': put it right before the old edit tab
// 'after': put it right after the old edit tab
$wgVisualEditorTabPosition = 'before';

$wgVisualEditorTabMessages = array(
	// i18n message key to use for the VisualEditor edit tab
	// If null, the default edit tab caption will be used
	// The 'visualeditor-ca-ve-edit' message is available for this
	'edit' => null,
	// i18n message key to use for the old edit tab
	// If null, the tab's caption will not be changed
	'editsource' => 'visualeditor-ca-editsource',
	// i18n message key to use for the VisualEditor create tab
	// If null, the default create tab caption will be used
	// The 'visualeditor-ca-ve-create' message is available for this
	'create' => null,
	// i18n message key to use for the old create tab
	// If null, the tab's caption will not be changed
	'createsource' => 'visualeditor-ca-createsource',
	// i18n message key to use for the VisualEditor section edit link
	// If null, the default edit section link caption will be used
	'editsection' => null,
	// i18n message key to use for the source section edit link
	// If null, the link's caption will not be changed
	'editsectionsource' => 'visualeditor-ca-editsource-section',

	// i18n message key for an optional appendix to add to each of these from JS
	// Use this if you have HTML messages to add
	// The 'visualeditor-beta-appendix' message is available for this purpose
	'editappendix' => null,
	'editsourceappendix' => null,
	'createappendix' => null,
	'createsourceappendix' => null,
	'editsectionappendix' => null,
	'editsectionsourceappendix' => null,
);
