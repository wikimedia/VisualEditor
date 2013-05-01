<?php
/**
 * VisualEditor extension
 *
 * @file
 * @ingroup Extensions
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/* Configuration */

// URL to the Parsoid instance
// MUST NOT end in a slash due to Parsoid bug
$wgVisualEditorParsoidURL = 'http://localhost:8000';
// Interwiki prefix to pass to the Parsoid instance
// Parsoid will be called as $url/$prefix/$pagename
$wgVisualEditorParsoidPrefix = 'localhost';
// Timeout for HTTP requests to Parsoid in seconds
$wgVisualEditorParsoidTimeout = 100;
// URL to post reports from the "Report problem" dialog to
// Defaults to "$wgVisualEditorParsoidURL/_bugs/" if null
$wgVisualEditorParsoidProblemReportURL = null;
// Namespaces to enable VisualEditor in
$wgVisualEditorNamespaces = array( NS_MAIN );
// Whether to use change tagging for VisualEditor edits
$wgVisualEditorUseChangeTagging = true;
// Whether to enable incomplete experimental code
$wgVisualEditorEnableExperimentalCode = false;

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
	),
	'version' => '0.1.0',
	'url' => 'https://www.mediawiki.org/wiki/Extension:VisualEditor',
	'descriptionmsg' => 'visualeditor-desc',
);
$dir = dirname( __FILE__ ) . '/';
$wgExtensionMessagesFiles['VisualEditor'] = $dir . 'VisualEditor.i18n.php';

$wgVisualEditorResourceTemplate = array(
	'localBasePath' => dirname( __FILE__ ) . '/modules',
	'remoteExtPath' => 'VisualEditor/modules',
	'group' => 'ext.visualEditor',
);

$wgVisualEditorEditNotices = array( 'visualeditor-alphawarning' );

$wgVisualEditorEnableSectionEditLinks = false;

$wgResourceModules += array(
	'rangy' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'rangy/rangy-core.js',
			'rangy/rangy-position.js',
			'rangy/rangy-export.js',
		),
	),
	'jquery.visibleText' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'jquery/jquery.visibleText.js',
		),
	),
	'unicodejs.wordbreak' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			'unicodejs/unicodejs.js',
			'unicodejs/unicodejs.textstring.js',
			'unicodejs/unicodejs.wordbreak.groups.js',
			'unicodejs/unicodejs.wordbreak.js',
		),
	),
	// Alias for backwards compat, safe to remove after
	'ext.visualEditor.editPageInit' => $wgVisualEditorResourceTemplate + array(
		'dependencies' => array(
			'ext.visualEditor.viewPageTarget',
		)
	),
	'ext.visualEditor.viewPageTarget.icons-raster' => $wgVisualEditorResourceTemplate + array(
		'styles' => array(
			've/init/mw/styles/ve.init.mw.ViewPageTarget.Icons-raster.css',
		),
	),
	'ext.visualEditor.viewPageTarget.icons-vector' => $wgVisualEditorResourceTemplate + array(
		'styles' => array(
			've/init/mw/styles/ve.init.mw.ViewPageTarget.Icons-vector.css',
		),
	),
	'ext.visualEditor.viewPageTarget' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			've/init/mw/targets/ve.init.mw.ViewPageTarget.js',
		),
		'styles' => array(
			've/init/mw/styles/ve.init.mw.ViewPageTarget.css',
		),
		'skinStyles' => array(
			'vector' => array(
				've/init/mw/styles/ve.init.mw.ViewPageTarget-vector.css',
				've/init/mw/styles/ve.init.mw.ViewPageTarget-vector-hd.css' => array(
					'media' => 'screen and (min-width: 982px)'
				),
			),
			'apex' => array(
				've/init/mw/styles/ve.init.mw.ViewPageTarget-apex.css',
			),
			'monobook' => array(
				've/init/mw/styles/ve.init.mw.ViewPageTarget-monobook.css',
			)
		),
		'dependencies' => array(
			'ext.visualEditor.base',
			'jquery.byteLength',
			'jquery.byteLimit',
			'jquery.client',
			'jquery.placeholder',
			'jquery.visibleText',
			'mediawiki.jqueryMsg',
			'mediawiki.Title',
			'mediawiki.Uri',
			'mediawiki.user',
			'mediawiki.util',
			'mediawiki.notify',
			'mediawiki.feedback',
			'user.options',
			'user.tokens',
		),
		'messages' => array(
			'minoredit',
			'cancel',
			'watchthis',
			'copyrightwarning',
			'copyrightpage',
			'accesskey-ca-editsource',
			'accesskey-ca-ve-edit',
			'tooltip-ca-editsource',
			'tooltip-ca-ve-edit',
			'visualeditor-ca-editsource',
			'visualeditor-ca-ve-edit',
			'visualeditor-ca-ve-create',
			'visualeditor-notification-saved',
			'visualeditor-notification-created',
			'visualeditor-notification-restored',
			'visualeditor-notification-reported',
			'visualeditor-loadwarning',
			'visualeditor-editsummary',
			'visualeditor-problem',
			'visualeditor-editnotices-tool',
			'visualeditor-feedback-tool',
			'visualeditor-feedback-link',
			'visualeditor-restore-page',
			'visualeditor-create-page',
			'visualeditor-save-title',
			'visualeditor-report-notice',
			'visualeditor-toolbar-savedialog',
			'visualeditor-savedialog-title-review',
			'visualeditor-savedialog-title-report',
			'visualeditor-savedialog-title-save',
			'visualeditor-savedialog-label-review-wrong',
			'visualeditor-savedialog-label-review-good',
			'visualeditor-savedialog-label-report',
			'visualeditor-savedialog-label-create',
			'visualeditor-savedialog-label-save',
			'visualeditor-savedialog-label-restore',
			'visualeditor-savedialog-label-report',
		),
	),
	'ext.visualEditor.base' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			// ve
			've/ve.js',
			've/ve.EventEmitter.js',

			// init
			've/init/ve.init.js',
			've/init/ve.init.Platform.js',
			've/init/ve.init.Target.js',
			've/init/mw/ve.init.mw.js',
			've/init/mw/ve.init.mw.Platform.js',
			've/init/mw/ve.init.mw.Target.js',
		),
		'dependencies' => array(
			'jquery.client',
		),
		'debugScripts' => array(
			've/ve.debug.js',
		),
	),
	'ext.visualEditor.specialMessages' => $wgVisualEditorResourceTemplate + array(
		'class' => 'VisualEditorMessagesModule'
	),
	'ext.visualEditor.core' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			// ve
			've/ve.Registry.js',
			've/ve.Factory.js',
			've/ve.Trigger.js',
			've/ve.CommandRegistry.js',
			've/ve.TriggerRegistry.js',
			've/ve.Range.js',
			've/ve.Node.js',
			've/ve.NamedClassFactory.js',
			've/ve.BranchNode.js',
			've/ve.LeafNode.js',
			've/ve.Surface.js',
			've/ve.Document.js',
			've/ve.Action.js',
			've/ve.ActionFactory.js',

			// actions
			've/actions/ve.AnnotationAction.js',
			've/actions/ve.ContentAction.js',
			've/actions/ve.FormatAction.js',
			've/actions/ve.HistoryAction.js',
			've/actions/ve.IndentationAction.js',
			've/actions/ve.InspectorAction.js',
			've/actions/ve.ListAction.js',

			// dm
			've/dm/ve.dm.js',
			've/dm/ve.dm.Model.js',
			've/dm/ve.dm.ModelRegistry.js',
			've/dm/ve.dm.NodeFactory.js',
			've/dm/ve.dm.AnnotationFactory.js',
			've/dm/ve.dm.AnnotationSet.js',
			've/dm/ve.dm.MetaItemFactory.js',
			've/dm/ve.dm.Node.js',
			've/dm/ve.dm.BranchNode.js',
			've/dm/ve.dm.LeafNode.js',
			've/dm/ve.dm.Annotation.js',
			've/dm/ve.dm.InternalList.js',
			've/dm/ve.dm.MetaItem.js',
			've/dm/ve.dm.MetaList.js',
			've/dm/ve.dm.TransactionProcessor.js',
			've/dm/ve.dm.Transaction.js',
			've/dm/ve.dm.Surface.js',
			've/dm/ve.dm.SurfaceFragment.js',
			've/dm/ve.dm.DataString.js',
			've/dm/ve.dm.Document.js',
			've/dm/ve.dm.LinearData.js',
			've/dm/ve.dm.DocumentSlice.js',
			've/dm/ve.dm.DocumentSynchronizer.js',
			've/dm/ve.dm.IndexValueStore.js',
			've/dm/ve.dm.Converter.js',

			've/dm/lineardata/ve.dm.ElementLinearData.js',
			've/dm/lineardata/ve.dm.MetaLinearData.js',

			've/dm/nodes/ve.dm.GeneratedContentNode.js',
			've/dm/nodes/ve.dm.AlienNode.js',
			've/dm/nodes/ve.dm.BreakNode.js',
			've/dm/nodes/ve.dm.CenterNode.js',
			've/dm/nodes/ve.dm.DefinitionListItemNode.js',
			've/dm/nodes/ve.dm.DefinitionListNode.js',
			've/dm/nodes/ve.dm.DivNode.js',
			've/dm/nodes/ve.dm.DocumentNode.js',
			've/dm/nodes/ve.dm.HeadingNode.js',
			've/dm/nodes/ve.dm.ImageNode.js',
			've/dm/nodes/ve.dm.InternalItemNode.js',
			've/dm/nodes/ve.dm.InternalListNode.js',
			've/dm/nodes/ve.dm.ListItemNode.js',
			've/dm/nodes/ve.dm.ListNode.js',
			've/dm/nodes/ve.dm.ParagraphNode.js',
			've/dm/nodes/ve.dm.PreformattedNode.js',
			've/dm/nodes/ve.dm.TableCaptionNode.js',
			've/dm/nodes/ve.dm.TableCellNode.js',
			've/dm/nodes/ve.dm.TableNode.js',
			've/dm/nodes/ve.dm.TableRowNode.js',
			've/dm/nodes/ve.dm.TableSectionNode.js',
			've/dm/nodes/ve.dm.TextNode.js',

			've/dm/nodes/ve.dm.MWEntityNode.js',
			've/dm/nodes/ve.dm.MWHeadingNode.js',
			've/dm/nodes/ve.dm.MWPreformattedNode.js',

			've/dm/annotations/ve.dm.LinkAnnotation.js',
			've/dm/annotations/ve.dm.MWExternalLinkAnnotation.js',
			've/dm/annotations/ve.dm.MWInternalLinkAnnotation.js',
			've/dm/annotations/ve.dm.TextStyleAnnotation.js',

			've/dm/metaitems/ve.dm.AlienMetaItem.js',
			've/dm/metaitems/ve.dm.MWAlienMetaItem.js',
			've/dm/metaitems/ve.dm.MWCategoryMetaItem.js',
			've/dm/metaitems/ve.dm.MWDefaultSortMetaItem.js',
			've/dm/metaitems/ve.dm.MWLanguageMetaItem.js',

			// ce
			've/ce/ve.ce.js',
			've/ce/ve.ce.DomRange.js',
			've/ce/ve.ce.AnnotationFactory.js',
			've/ce/ve.ce.NodeFactory.js',
			've/ce/ve.ce.Document.js',
			've/ce/ve.ce.View.js',
			've/ce/ve.ce.Annotation.js',
			've/ce/ve.ce.Node.js',
			've/ce/ve.ce.BranchNode.js',
			've/ce/ve.ce.ContentBranchNode.js',
			've/ce/ve.ce.LeafNode.js',
			've/ce/ve.ce.FocusableNode.js',
			've/ce/ve.ce.RelocatableNode.js',
			've/ce/ve.ce.ResizableNode.js',
			've/ce/ve.ce.Surface.js',
			've/ce/ve.ce.SurfaceObserver.js',

			've/ce/nodes/ve.ce.GeneratedContentNode.js',
			've/ce/nodes/ve.ce.AlienNode.js',
			've/ce/nodes/ve.ce.BreakNode.js',
			've/ce/nodes/ve.ce.CenterNode.js',
			've/ce/nodes/ve.ce.DefinitionListItemNode.js',
			've/ce/nodes/ve.ce.DefinitionListNode.js',
			've/ce/nodes/ve.ce.DivNode.js',
			've/ce/nodes/ve.ce.DocumentNode.js',
			've/ce/nodes/ve.ce.HeadingNode.js',
			've/ce/nodes/ve.ce.ImageNode.js',
			've/ce/nodes/ve.ce.InternalItemNode.js',
			've/ce/nodes/ve.ce.InternalListNode.js',
			've/ce/nodes/ve.ce.ListItemNode.js',
			've/ce/nodes/ve.ce.ListNode.js',
			've/ce/nodes/ve.ce.ParagraphNode.js',
			've/ce/nodes/ve.ce.PreformattedNode.js',
			've/ce/nodes/ve.ce.TableCaptionNode.js',
			've/ce/nodes/ve.ce.TableCellNode.js',
			've/ce/nodes/ve.ce.TableNode.js',
			've/ce/nodes/ve.ce.TableRowNode.js',
			've/ce/nodes/ve.ce.TableSectionNode.js',
			've/ce/nodes/ve.ce.TextNode.js',

			've/ce/nodes/ve.ce.MWEntityNode.js',
			've/ce/nodes/ve.ce.MWHeadingNode.js',
			've/ce/nodes/ve.ce.MWPreformattedNode.js',

			've/ce/annotations/ve.ce.LinkAnnotation.js',
			've/ce/annotations/ve.ce.MWExternalLinkAnnotation.js',
			've/ce/annotations/ve.ce.MWInternalLinkAnnotation.js',
			've/ce/annotations/ve.ce.TextStyleAnnotation.js',

			// ui
			've/ui/ve.ui.js',
			've/ui/ve.ui.Context.js',
			've/ui/ve.ui.Frame.js',
			've/ui/ve.ui.Window.js',
			've/ui/ve.ui.WindowSet.js',
			've/ui/ve.ui.ViewRegistry.js',
			've/ui/ve.ui.Inspector.js',
			've/ui/ve.ui.InspectorFactory.js',
			've/ui/ve.ui.Dialog.js',
			've/ui/ve.ui.DialogFactory.js',
			've/ui/ve.ui.Element.js',
			've/ui/ve.ui.Layout.js',
			've/ui/ve.ui.Widget.js',
			've/ui/ve.ui.Tool.js',
			've/ui/ve.ui.Toolbar.js',
			've/ui/ve.ui.ToolFactory.js',

			've/ui/elements/ve.ui.LabeledElement.js',
			've/ui/elements/ve.ui.GroupElement.js',
			've/ui/elements/ve.ui.FlaggableElement.js',

			've/ui/widgets/ve.ui.PopupWidget.js',
			've/ui/widgets/ve.ui.SelectWidget.js',
			've/ui/widgets/ve.ui.OptionWidget.js',
			've/ui/widgets/ve.ui.ButtonWidget.js',
			've/ui/widgets/ve.ui.IconButtonWidget.js',
			've/ui/widgets/ve.ui.InputWidget.js',
			've/ui/widgets/ve.ui.InputLabelWidget.js',
			've/ui/widgets/ve.ui.TextInputWidget.js',
			've/ui/widgets/ve.ui.OutlineItemWidget.js',
			've/ui/widgets/ve.ui.OutlineWidget.js',
			've/ui/widgets/ve.ui.MenuItemWidget.js',
			've/ui/widgets/ve.ui.MenuSectionItemWidget.js',
			've/ui/widgets/ve.ui.MenuWidget.js',
			've/ui/widgets/ve.ui.PendingInputWidget.js',
			've/ui/widgets/ve.ui.LookupInputWidget.js',
			've/ui/widgets/ve.ui.TextInputMenuWidget.js',
			've/ui/widgets/ve.ui.LinkTargetInputWidget.js',
			've/ui/widgets/ve.ui.MWLinkTargetInputWidget.js',
			've/ui/widgets/ve.ui.MWCategoryInputWidget.js',
			've/ui/widgets/ve.ui.MWCategoryPopupWidget.js',
			've/ui/widgets/ve.ui.MWCategoryItemWidget.js',
			've/ui/widgets/ve.ui.MWCategoryWidget.js',

			've/ui/layouts/ve.ui.GridLayout.js',
			've/ui/layouts/ve.ui.PanelLayout.js',
			've/ui/layouts/panels/ve.ui.StackPanelLayout.js',
			've/ui/layouts/panels/ve.ui.PagePanelLayout.js',

			've/ui/dialogs/ve.ui.ContentDialog.js',
			've/ui/dialogs/ve.ui.MediaDialog.js',
			've/ui/dialogs/ve.ui.PagedDialog.js',
			've/ui/dialogs/ve.ui.MWMetaDialog.js',

			've/ui/tools/ve.ui.ButtonTool.js',
			've/ui/tools/ve.ui.AnnotationButtonTool.js',
			've/ui/tools/ve.ui.DialogButtonTool.js',
			've/ui/tools/ve.ui.InspectorButtonTool.js',
			've/ui/tools/ve.ui.IndentationButtonTool.js',
			've/ui/tools/ve.ui.ListButtonTool.js',
			've/ui/tools/ve.ui.DropdownTool.js',

			've/ui/tools/buttons/ve.ui.BoldButtonTool.js',
			've/ui/tools/buttons/ve.ui.ItalicButtonTool.js',
			've/ui/tools/buttons/ve.ui.ClearButtonTool.js',
			've/ui/tools/buttons/ve.ui.MediaButtonTool.js',
			've/ui/tools/buttons/ve.ui.LinkButtonTool.js',
			've/ui/tools/buttons/ve.ui.MWLinkButtonTool.js',
			've/ui/tools/buttons/ve.ui.BulletButtonTool.js',
			've/ui/tools/buttons/ve.ui.NumberButtonTool.js',
			've/ui/tools/buttons/ve.ui.IndentButtonTool.js',
			've/ui/tools/buttons/ve.ui.OutdentButtonTool.js',
			've/ui/tools/buttons/ve.ui.RedoButtonTool.js',
			've/ui/tools/buttons/ve.ui.UndoButtonTool.js',

			've/ui/tools/dropdowns/ve.ui.FormatDropdownTool.js',
			've/ui/tools/dropdowns/ve.ui.MWFormatDropdownTool.js',

			've/ui/inspectors/ve.ui.LinkInspector.js',
			've/ui/inspectors/ve.ui.MWLinkInspector.js',
		),
		'styles' => array(
			// ve
			've/styles/ve.Surface.css',
			// ce
			've/ce/styles/ve.ce.DocumentNode.css',
			've/ce/styles/ve.ce.Node.css',
			've/ce/styles/ve.ce.Surface.css',
			// ui
			've/ui/styles/ve.ui.css',
			've/ui/styles/ve.ui.Context.css',
			've/ui/styles/ve.ui.Frame.css',
			've/ui/styles/ve.ui.Window.css',
			've/ui/styles/ve.ui.Dialog.css',
			've/ui/styles/ve.ui.Inspector.css',
			've/ui/styles/ve.ui.Toolbar.css',
			've/ui/styles/ve.ui.Tool.css',
			've/ui/styles/ve.ui.Element.css',
			've/ui/styles/ve.ui.Layout.css',
			've/ui/styles/ve.ui.Widget.css',
		),
		'dependencies' => array(
			'jquery',
			'rangy',
			'unicodejs.wordbreak',
			'ext.visualEditor.base',
			'mediawiki.Title',
			'jquery.autoEllipsis',
		),
		'messages' => array(
			'visualeditor',
			'visualeditor-inspector-title',
			'visualeditor-linkinspector-title',
			'visualeditor-linkinspector-label-pagetitle',
			'visualeditor-linkinspector-suggest-matching-page',
			'visualeditor-linkinspector-suggest-new-page',
			'visualeditor-linkinspector-suggest-external-link',
			'visualeditor-formatdropdown-title',
			'visualeditor-formatdropdown-format-paragraph',
			'visualeditor-formatdropdown-format-heading1',
			'visualeditor-formatdropdown-format-heading2',
			'visualeditor-formatdropdown-format-heading3',
			'visualeditor-formatdropdown-format-heading4',
			'visualeditor-formatdropdown-format-heading5',
			'visualeditor-formatdropdown-format-heading6',
			'visualeditor-formatdropdown-format-preformatted',
			'visualeditor-annotationbutton-bold-tooltip',
			'visualeditor-annotationbutton-italic-tooltip',
			'visualeditor-annotationbutton-link-tooltip',
			'visualeditor-dialogbutton-media-tooltip',
			'visualeditor-indentationbutton-indent-tooltip',
			'visualeditor-indentationbutton-outdent-tooltip',
			'visualeditor-listbutton-number-tooltip',
			'visualeditor-listbutton-bullet-tooltip',
			'visualeditor-clearbutton-tooltip',
			'visualeditor-historybutton-undo-tooltip',
			'visualeditor-historybutton-redo-tooltip',
			'visualeditor-inspector-close-tooltip',
			'visualeditor-inspector-remove-tooltip',
			'visualeditor-viewpage-savewarning',
			'visualeditor-differror',
			'visualeditor-serializeerror',
			'visualeditor-saveerror',
			'visualeditor-editconflict',
			'visualeditor-aliennode-tooltip',
			'visualeditor-dialog-meta-title',
			'visualeditor-dialog-media-title',
			'visualeditor-dialog-content-title',
			'visualeditor-dialog-action-apply',
			'visualeditor-dialog-action-cancel',
			'visualeditor-dialog-action-close',
			'visualeditor-category-input-placeholder',
			'visualeditor-category-settings-label'
		),
	),
	'ext.visualEditor.experimental' => $wgVisualEditorResourceTemplate + array(
		'scripts' => array(
			've/dm/nodes/ve.dm.MWInlineImageNode.js',
			've/dm/nodes/ve.dm.MWBlockImageNode.js',
			've/dm/nodes/ve.dm.MWImageCaptionNode.js',
			've/dm/nodes/ve.dm.MWTemplateNode.js',
			've/dm/nodes/ve.dm.MWReferenceListNode.js',
			've/dm/nodes/ve.dm.MWReferenceNode.js',

			've/ce/nodes/ve.ce.MWInlineImageNode.js',
			've/ce/nodes/ve.ce.MWBlockImageNode.js',
			've/ce/nodes/ve.ce.MWImageCaptionNode.js',
			've/ce/nodes/ve.ce.MWTemplateNode.js',
			've/ce/nodes/ve.ce.MWReferenceListNode.js',
			've/ce/nodes/ve.ce.MWReferenceNode.js',
		),
		'dependencies' => array(
			'ext.visualEditor.core',
		)
	),
	'ext.visualEditor.icons-raster' => $wgVisualEditorResourceTemplate + array(
		'styles' => array(
			've/ui/styles/ve.ui.Icons-raster.css',
		),
	),
	'ext.visualEditor.icons-vector' => $wgVisualEditorResourceTemplate + array(
		'styles' => array(
			've/ui/styles/ve.ui.Icons-vector.css',
		),
	),
);
// Parsoid Wrapper API
$wgAutoloadClasses['ApiVisualEditor'] = $dir . 'ApiVisualEditor.php';
$wgAPIModules['visualeditor'] = 'ApiVisualEditor';

// Integration Hooks
$wgAutoloadClasses['VisualEditorHooks'] = $dir . 'VisualEditor.hooks.php';
$wgHooks['BeforePageDisplay'][] = 'VisualEditorHooks::onBeforePageDisplay';
$wgHooks['GetPreferences'][] = 'VisualEditorHooks::onGetPreferences';
$wgHooks['ListDefinedTags'][] = 'VisualEditorHooks::onListDefinedTags';
$wgHooks['MakeGlobalVariablesScript'][] = 'VisualEditorHooks::onMakeGlobalVariablesScript';
$wgHooks['ResourceLoaderGetConfigVars'][] = 'VisualEditorHooks::onResourceLoaderGetConfigVars';
$wgHooks['ResourceLoaderTestModules'][] = 'VisualEditorHooks::onResourceLoaderTestModules';

$wgAutoloadClasses['VisualEditorMessagesModule'] = $dir . 'VisualEditorMessagesModule.php';
