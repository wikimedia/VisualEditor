<?php
/**
 * VisualEditor standalone demo
 *
 * @file
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

// Find all .html files in the pages directory
$path = __DIR__ . '/pages';
$pages = glob( $path . '/*.html' );
$page = current( $pages );

// If the ?page= parameter is set, and that page exists, load it
if ( isset( $_GET['page'] ) && in_array( $path . '/' . $_GET['page'] . '.html', $pages ) ) {
	$page = $path . '/' . $_GET['page'] . '.html';
}
$html = file_get_contents( $page );

// TODO: get rid of the PHP-based loading system and make the demo purely HTML+JS

?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>VisualEditor Standalone Demo</title>

		<!-- oojs-ui -->
		<link rel=stylesheet href="../../modules/oojs-ui/oojs-ui.svg.css">

		<!-- jquery.uls.grid -->
		<link rel=stylesheet href="../../modules/jquery.uls/css/jquery.uls.grid.css">

		<!-- jquery.uls.compact -->
		<link rel=stylesheet href="../../modules/jquery.uls/css/jquery.uls.compact.css">

		<!-- jquery.uls -->
		<link rel=stylesheet href="../../modules/jquery.uls/css/jquery.uls.css">
		<link rel=stylesheet href="../../modules/jquery.uls/css/jquery.uls.lcd.css">

		<!-- visualEditor.standalone -->
		<link rel=stylesheet href="../../modules/ve/init/sa/styles/ve.init.sa.css">

		<!-- visualEditor.core -->
		<link rel=stylesheet href="../../modules/ve/ce/styles/ve.ce.Node.css">
		<link rel=stylesheet href="../../modules/ve/ce/styles/ve.ce.Surface.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Context.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Inspector.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Surface.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Tool.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Toolbar.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Widget.css">
		<link rel=stylesheet href="../../modules/ve/ui/styles/ve.ui.Icons-vector.css">

		<!-- demo styles -->
		<link rel="stylesheet" href="demo.css">
	</head>
	<body>
		<ul class="ve-demo-docs">
			<?php
				foreach ( $pages as $page ): ?>
				<li>
					<a href="./?page=<?php echo basename( $page, '.html' ); ?>">
						<?php echo basename( $page, '.html' ); ?>
					</a>
				</li>
			<?php
				endforeach;
			?>
		</ul>
		<div class="ve-demo-editor"></div>
		<div class="ve-demo-utilities">
			<p>
				<div class="ve-demo-utilities-commands"></div>
			</p>
			<table id="ve-dump" class="ve-demo-dump">
				<thead>
					<th>Linear model</th>
					<th>View tree</th>
					<th>Model tree</th>
				</thead>
				<tbody>
					<tr>
						<td width="30%" id="ve-linear-model-dump"></td>
						<td id="ve-view-tree-dump" style="vertical-align: top;"></td>
						<td id="ve-model-tree-dump" style="vertical-align: top;"></td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- jquery -->
		<script src="../../modules/jquery/jquery.js"></script>

		<!-- oojs -->
		<script src="../../modules/oojs/oojs.js"></script>

		<!-- oojs-ui -->
		<script src="../../modules/oojs-ui/oojs-ui.js"></script>

		<!-- rangy -->
		<script src="../../modules/rangy/rangy-core-1.3.js"></script>
		<script src="../../modules/rangy/rangy-position-1.3.js"></script>
		<script src="../../modules/rangy/rangy-export.js"></script>

		<!-- unicodejs -->
		<script src="../../modules/unicodejs/unicodejs.js"></script>
		<script src="../../modules/unicodejs/unicodejs.textstring.js"></script>
		<script src="../../modules/unicodejs/unicodejs.graphemebreakproperties.js"></script>
		<script src="../../modules/unicodejs/unicodejs.graphemebreak.js"></script>
		<script src="../../modules/unicodejs/unicodejs.wordbreakproperties.js"></script>
		<script src="../../modules/unicodejs/unicodejs.wordbreak.js"></script>

		<!-- jquery.uls.data -->
		<script src="../../modules/jquery.uls/src/jquery.uls.data.js"></script>
		<script src="../../modules/jquery.uls/src/jquery.uls.data.utils.js"></script>

		<!-- jquery.uls -->
		<script src="../../modules/jquery.uls/src/jquery.uls.core.js"></script>
		<script src="../../modules/jquery.uls/src/jquery.uls.lcd.js"></script>
		<script src="../../modules/jquery.uls/src/jquery.uls.languagefilter.js"></script>
		<script src="../../modules/jquery.uls/src/jquery.uls.regionfilter.js"></script>

		<!-- jquery.i18n -->
		<script src="../../modules/jquery.i18n/src/jquery.i18n.js"></script>
		<script src="../../modules/jquery.i18n/src/jquery.i18n.messagestore.js"></script>
		<script src="../../modules/jquery.i18n/src/jquery.i18n.parser.js"></script>
		<script src="../../modules/jquery.i18n/src/jquery.i18n.emitter.js"></script>
		<script src="../../modules/jquery.i18n/src/jquery.i18n.language.js"></script>
		<script src="../../modules/jquery.i18n/src/jquery.i18n.fallbacks.js"></script>
		<script src="../../modules/jquery.i18n/src/languages/bs.js"></script>
		<script src="../../modules/jquery.i18n/src/languages/dsb.js"></script>
		<script src="../../modules/jquery.i18n/src/languages/fi.js"></script>
		<script src="../../modules/jquery.i18n/src/languages/ga.js"></script>
		<script src="../../modules/jquery.i18n/src/languages/he.js"></script>
		<script src="../../modules/jquery.i18n/src/languages/hsb.js"></script>
		<script src="../../modules/jquery.i18n/src/languages/hu.js"></script>
		<script src="../../modules/jquery.i18n/src/languages/hy.js"></script>
		<script src="../../modules/jquery.i18n/src/languages/la.js"></script>
		<script src="../../modules/jquery.i18n/src/languages/ml.js"></script>
		<script src="../../modules/jquery.i18n/src/languages/os.js"></script>
		<script src="../../modules/jquery.i18n/src/languages/ru.js"></script>
		<script src="../../modules/jquery.i18n/src/languages/sl.js"></script>
		<script src="../../modules/jquery.i18n/src/languages/uk.js"></script>

		<!-- visualEditor.base -->
		<script src="../../modules/ve/ve.js"></script>
		<script src="../../modules/ve/ve.track.js"></script>
		<script src="../../modules/ve/init/ve.init.js"></script>
		<script src="../../modules/ve/init/ve.init.Platform.js"></script>
		<script src="../../modules/ve/init/ve.init.Target.js"></script>

		<!-- visualEditor.standalone -->
		<script src="../../modules/ve/init/sa/ve.init.sa.js"></script>
		<script src="../../modules/ve/init/sa/ve.init.sa.Platform.js"></script>
		<script src="../../modules/ve/init/sa/ve.init.sa.Target.js"></script>

		<!-- visualEditor.core -->
		<script src="../../modules/ve/ve.Range.js"></script>
		<script src="../../modules/ve/ve.Node.js"></script>
		<script src="../../modules/ve/ve.BranchNode.js"></script>
		<script src="../../modules/ve/ve.LeafNode.js"></script>
		<script src="../../modules/ve/ve.Document.js"></script>
		<script src="../../modules/ve/ve.EventSequencer.js"></script>
		<script src="../../modules/ve/dm/ve.dm.js"></script>
		<script src="../../modules/ve/dm/ve.dm.Model.js"></script>
		<script src="../../modules/ve/dm/ve.dm.ModelRegistry.js"></script>
		<script src="../../modules/ve/dm/ve.dm.NodeFactory.js"></script>
		<script src="../../modules/ve/dm/ve.dm.AnnotationFactory.js"></script>
		<script src="../../modules/ve/dm/ve.dm.AnnotationSet.js"></script>
		<script src="../../modules/ve/dm/ve.dm.MetaItemFactory.js"></script>
		<script src="../../modules/ve/dm/ve.dm.Node.js"></script>
		<script src="../../modules/ve/dm/ve.dm.BranchNode.js"></script>
		<script src="../../modules/ve/dm/ve.dm.LeafNode.js"></script>
		<script src="../../modules/ve/dm/ve.dm.Annotation.js"></script>
		<script src="../../modules/ve/dm/ve.dm.InternalList.js"></script>
		<script src="../../modules/ve/dm/ve.dm.MetaItem.js"></script>
		<script src="../../modules/ve/dm/ve.dm.MetaList.js"></script>
		<script src="../../modules/ve/dm/ve.dm.TransactionProcessor.js"></script>
		<script src="../../modules/ve/dm/ve.dm.Transaction.js"></script>
		<script src="../../modules/ve/dm/ve.dm.Surface.js"></script>
		<script src="../../modules/ve/dm/ve.dm.SurfaceFragment.js"></script>
		<script src="../../modules/ve/dm/ve.dm.DataString.js"></script>
		<script src="../../modules/ve/dm/ve.dm.Document.js"></script>
		<script src="../../modules/ve/dm/ve.dm.DocumentSlice.js"></script>
		<script src="../../modules/ve/dm/ve.dm.LinearData.js"></script>
		<script src="../../modules/ve/dm/ve.dm.DocumentSynchronizer.js"></script>
		<script src="../../modules/ve/dm/ve.dm.IndexValueStore.js"></script>
		<script src="../../modules/ve/dm/ve.dm.Converter.js"></script>
		<script src="../../modules/ve/dm/lineardata/ve.dm.FlatLinearData.js"></script>
		<script src="../../modules/ve/dm/lineardata/ve.dm.ElementLinearData.js"></script>
		<script src="../../modules/ve/dm/lineardata/ve.dm.MetaLinearData.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.GeneratedContentNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.AlienNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.BreakNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.CenterNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.DefinitionListItemNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.DefinitionListNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.DivNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.DocumentNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.HeadingNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.ImageNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.InternalItemNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.InternalListNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.ListItemNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.ListNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.ParagraphNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.PreformattedNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.TableCaptionNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.TableCellNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.TableNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.TableRowNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.TableSectionNode.js"></script>
		<script src="../../modules/ve/dm/nodes/ve.dm.TextNode.js"></script>
		<script src="../../modules/ve/dm/annotations/ve.dm.LanguageAnnotation.js"></script>
		<script src="../../modules/ve/dm/annotations/ve.dm.LinkAnnotation.js"></script>
		<script src="../../modules/ve/dm/annotations/ve.dm.TextStyleAnnotation.js"></script>
		<script src="../../modules/ve/dm/metaitems/ve.dm.AlienMetaItem.js"></script>
		<script src="../../modules/ve/ce/ve.ce.js"></script>
		<script src="../../modules/ve/ce/ve.ce.DomRange.js"></script>
		<script src="../../modules/ve/ce/ve.ce.AnnotationFactory.js"></script>
		<script src="../../modules/ve/ce/ve.ce.NodeFactory.js"></script>
		<script src="../../modules/ve/ce/ve.ce.Document.js"></script>
		<script src="../../modules/ve/ce/ve.ce.View.js"></script>
		<script src="../../modules/ve/ce/ve.ce.Annotation.js"></script>
		<script src="../../modules/ve/ce/ve.ce.Node.js"></script>
		<script src="../../modules/ve/ce/ve.ce.BranchNode.js"></script>
		<script src="../../modules/ve/ce/ve.ce.ContentBranchNode.js"></script>
		<script src="../../modules/ve/ce/ve.ce.LeafNode.js"></script>
		<script src="../../modules/ve/ce/ve.ce.ProtectedNode.js"></script>
		<script src="../../modules/ve/ce/ve.ce.FocusableNode.js"></script>
		<script src="../../modules/ve/ce/ve.ce.RelocatableNode.js"></script>
		<script src="../../modules/ve/ce/ve.ce.ResizableNode.js"></script>
		<script src="../../modules/ve/ce/ve.ce.Surface.js"></script>
		<script src="../../modules/ve/ce/ve.ce.SurfaceObserver.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.GeneratedContentNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.AlienNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.BreakNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.CenterNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.DefinitionListItemNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.DefinitionListNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.DivNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.DocumentNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.HeadingNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.ImageNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.InternalItemNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.InternalListNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.ListItemNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.ListNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.ParagraphNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.PreformattedNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.TableCaptionNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.TableCellNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.TableNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.TableRowNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.TableSectionNode.js"></script>
		<script src="../../modules/ve/ce/nodes/ve.ce.TextNode.js"></script>
		<script src="../../modules/ve/ce/annotations/ve.ce.LanguageAnnotation.js"></script>
		<script src="../../modules/ve/ce/annotations/ve.ce.LinkAnnotation.js"></script>
		<script src="../../modules/ve/ce/annotations/ve.ce.TextStyleAnnotation.js"></script>
		<script src="../../modules/ve/ui/ve.ui.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Surface.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Context.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Dialog.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Inspector.js"></script>
		<script src="../../modules/ve/ui/ve.ui.WindowSet.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Toolbar.js"></script>
		<script src="../../modules/ve/ui/ve.ui.TargetToolbar.js"></script>
		<script src="../../modules/ve/ui/ve.ui.ToolFactory.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Command.js"></script>
		<script src="../../modules/ve/ui/ve.ui.CommandRegistry.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Trigger.js"></script>
		<script src="../../modules/ve/ui/ve.ui.TriggerRegistry.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Action.js"></script>
		<script src="../../modules/ve/ui/ve.ui.ActionFactory.js"></script>
		<script src="../../modules/ve/ui/actions/ve.ui.AnnotationAction.js"></script>
		<script src="../../modules/ve/ui/actions/ve.ui.ContentAction.js"></script>
		<script src="../../modules/ve/ui/actions/ve.ui.DialogAction.js"></script>
		<script src="../../modules/ve/ui/actions/ve.ui.FormatAction.js"></script>
		<script src="../../modules/ve/ui/actions/ve.ui.HistoryAction.js"></script>
		<script src="../../modules/ve/ui/actions/ve.ui.IndentationAction.js"></script>
		<script src="../../modules/ve/ui/actions/ve.ui.InspectorAction.js"></script>
		<script src="../../modules/ve/ui/actions/ve.ui.ListAction.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.SurfaceWidget.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.LinkTargetInputWidget.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.AnnotationTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.ClearAnnotationTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.DialogTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.FormatTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.HistoryTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.IndentationTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.InspectorTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.LanguageInspectorTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.ListTool.js"></script>
		<script src="../../modules/ve/ui/inspectors/ve.ui.AnnotationInspector.js"></script>
		<script src="../../modules/ve/ui/inspectors/ve.ui.LinkInspector.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.LanguageInputWidget.js"></script>
		<script src="../../modules/ve/ui/inspectors/ve.ui.LanguageInspector.js"></script>
		<script src="../../modules/ve/ui/widgets/ve.ui.GroupButtonWidget.js"></script>
		<script src="../../modules/ve/ui/inspectors/ve.ui.SpecialCharacterInspector.js"></script>

		<script>ve.init.platform.setModulesUrl( '../../modules' );</script>

		<!-- demo scripts -->
		<script>
			$( function () {
				new ve.init.sa.Target(
					$( '.ve-demo-editor' ),
					ve.createDocumentFromHtml( <?php echo json_encode( $html ); ?> )
				);
				$( '.ve-ce-documentNode' ).focus();
			} );
		</script>
		<script src="demo.js"></script>
	</body>
</html>
