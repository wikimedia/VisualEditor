<!DOCTYPE html>

<html>
	<head>
		<meta charset="UTF-8" />
		<title>VisualEditor Demo</title>
		<!-- ce -->
		<link rel="stylesheet" href="../../modules/ve/ce/styles/ve.ce.Document.css">
		<link rel="stylesheet" href="../../modules/ve/ce/styles/ve.ce.Content.css">
		<link rel="stylesheet" href="../../modules/ve/ce/styles/ve.ce.Surface.css">
		<!-- ui -->
		<link rel="stylesheet" href="../../modules/ve/ui/styles/ve.ui.Context.css">
		<link rel="stylesheet" href="../../modules/ve/ui/styles/ve.ui.Inspector.css">
		<link rel="stylesheet" href="../../modules/ve/ui/styles/ve.ui.Menu.css">
		<link rel="stylesheet" href="../../modules/ve/ui/styles/ve.ui.Toolbar.css">
		<!-- sandbox -->
		<link rel="stylesheet" href="../../modules/sandbox/sandbox.css">
		<style>
			body {
				font-family: "Arial";
				font-size: 1em;
				width: 100%;
				margin: 1em 0;
				padding: 0;
				overflow-y: scroll;
				background-color: white;
			}
			#es-warning {
				margin: 2em 2em 1em 2em;
			}
			#es-docs {
				margin: 0 2em 1em 2em;
			}
			.es-base {
				margin: 2em;
				margin-top: 0em;
				-webkit-box-shadow: 0 0.25em 1.5em 0 #dddddd;
				-moz-box-shadow: 0 0.25em 1.5em 0 #dddddd;
				box-shadow: 0 0.25em 1.5em 0 #dddddd;
				-webkit-border-radius: 0.5em;
				-moz-border-radius: 0.5em;
				-o-border-radius: 0.5em;
				border-radius: 0.5em;
			}
			.es-panes {
				border: solid 1px #cccccc;
				border-top: none;
			}
			.es-editor, .es-showData .es-editor {
				padding-left: 1em;
				padding-right: 1em;
			}
			.es-toolbar {
				-webkit-border-radius: 0;
				-moz-border-radius: 0;
				-o-border-radius: 0;
				border-radius: 0;
				-webkit-border-top-right-radius: 0.25em;
				-moz-border-top-right-radius: 0.25em;
				-o-border-top-right-radius: 0.25em;
				border-top-right-radius: 0.25em;
				-webkit-border-top-left-radius: 0.25em;
				-moz-border-top-left-radius: 0.25em;
				-o-border-top-left-radius: 0.25em;
				border-top-left-radius: 0.25em;
			}
			.es-toolbar.float {
				left: 2em;
				right: 2em;
				top: 0;
			}
			.es-docs {
				margin-left: 2.5em;
			}
		</style>
	</head>
	<body>
<?php

include( '../../modules/sandbox/base.php' );

?>
		<!-- Rangy -->
		<script src="../../modules/rangy/rangy-core.js"></script>
		<script src="../../modules/rangy/rangy-position.js"></script>

		<!-- ve -->
		<script src="../../modules/jquery/jquery.js"></script>
		<script src="../../modules/ve2/ve.js"></script>
		<script src="../../modules/ve2/ve.NodeFactory.js"></script>
		<script src="../../modules/ve2/ve.Position.js"></script>
		<script src="../../modules/ve2/ve.Range.js"></script>
		<script src="../../modules/ve2/ve.EventEmitter.js"></script>
		<script src="../../modules/ve2/ve.Node.js"></script>
		<script src="../../modules/ve2/ve.BranchNode.js"></script>
		<script src="../../modules/ve2/ve.LeafNode.js"></script>
		<script src="../../modules/ve2/ve.Surface.js"></script>

		<!-- dm -->
		<script src="../../modules/ve2/dm/ve.dm.js"></script>
		<script src="../../modules/ve2/dm/ve.dm.NodeFactory.js"></script>
		<script src="../../modules/ve2/dm/ve.dm.Node.js"></script>
		<script src="../../modules/ve2/dm/ve.dm.BranchNode.js"></script>
		<script src="../../modules/ve2/dm/ve.dm.LeafNode.js"></script>
		<script src="../../modules/ve2/dm/ve.dm.TransactionProcessor.js"></script>
		<script src="../../modules/ve2/dm/ve.dm.Transaction.js"></script>
		<script src="../../modules/ve2/dm/ve.dm.Surface.js"></script>
		<script src="../../modules/ve2/dm/ve.dm.DocumentFragment.js"></script>
		<script src="../../modules/ve2/dm/ve.dm.Document.js"></script>
		<script src="../../modules/ve2/dm/ve.dm.HTMLConverter.js"></script>

		<script src="../../modules/ve2/dm/nodes/ve.dm.AlienNode.js"></script>
		<script src="../../modules/ve2/dm/nodes/ve.dm.DefinitionListItemNode.js"></script>
		<script src="../../modules/ve2/dm/nodes/ve.dm.DefinitionListNode.js"></script>
		<script src="../../modules/ve2/dm/nodes/ve.dm.DocumentNode.js"></script>
		<script src="../../modules/ve2/dm/nodes/ve.dm.HeadingNode.js"></script>
		<script src="../../modules/ve2/dm/nodes/ve.dm.ImageNode.js"></script>
		<script src="../../modules/ve2/dm/nodes/ve.dm.ListItemNode.js"></script>
		<script src="../../modules/ve2/dm/nodes/ve.dm.ListNode.js"></script>
		<script src="../../modules/ve2/dm/nodes/ve.dm.ParagraphNode.js"></script>
		<script src="../../modules/ve2/dm/nodes/ve.dm.PreformattedNode.js"></script>
		<script src="../../modules/ve2/dm/nodes/ve.dm.TableCellNode.js"></script>
		<script src="../../modules/ve2/dm/nodes/ve.dm.TableNode.js"></script>
		<script src="../../modules/ve2/dm/nodes/ve.dm.TableRowNode.js"></script>
		<script src="../../modules/ve2/dm/nodes/ve.dm.TextNode.js"></script>

		<script src="../../modules/ve/dm/serializers/ve.dm.AnnotationSerializer.js"></script>
		<script src="../../modules/ve/dm/serializers/ve.dm.HtmlSerializer.js"></script>
		<script src="../../modules/ve/dm/serializers/ve.dm.JsonSerializer.js"></script>
		<script src="../../modules/ve/dm/serializers/ve.dm.WikitextSerializer.js"></script>

		<!-- ce -->
		<script src="../../modules/ve2/ce/ve.ce.js"></script>
		<script src="../../modules/ve2/ce/ve.ce.NodeFactory.js"></script>
		<script src="../../modules/ve2/ce/ve.ce.Document.js"></script>
		<script src="../../modules/ve2/ce/ve.ce.Node.js"></script>
		<script src="../../modules/ve2/ce/ve.ce.BranchNode.js"></script>
		<script src="../../modules/ve2/ce/ve.ce.LeafNode.js"></script>
		<script src="../../modules/ve2/ce/ve.ce.Surface.js"></script>

		<script src="../../modules/ve2/ce/nodes/ve.ce.AlienNode.js"></script>
		<script src="../../modules/ve2/ce/nodes/ve.ce.DefinitionListItemNode.js"></script>
		<script src="../../modules/ve2/ce/nodes/ve.ce.DefinitionListNode.js"></script>
		<script src="../../modules/ve2/ce/nodes/ve.ce.DocumentNode.js"></script>
		<script src="../../modules/ve2/ce/nodes/ve.ce.HeadingNode.js"></script>
		<script src="../../modules/ve2/ce/nodes/ve.ce.ImageNode.js"></script>
		<script src="../../modules/ve2/ce/nodes/ve.ce.ListItemNode.js"></script>
		<script src="../../modules/ve2/ce/nodes/ve.ce.ListNode.js"></script>
		<script src="../../modules/ve2/ce/nodes/ve.ce.ParagraphNode.js"></script>
		<script src="../../modules/ve2/ce/nodes/ve.ce.PreformattedNode.js"></script>
		<script src="../../modules/ve2/ce/nodes/ve.ce.TableCellNode.js"></script>
		<script src="../../modules/ve2/ce/nodes/ve.ce.TableNode.js"></script>
		<script src="../../modules/ve2/ce/nodes/ve.ce.TableRowNode.js"></script>
		<script src="../../modules/ve2/ce/nodes/ve.ce.TextNode.js"></script>

		<!-- ui -->
		<script src="../../modules/ve/ui/ve.ui.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Inspector.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Tool.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Toolbar.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Context.js"></script>
		<script src="../../modules/ve/ui/ve.ui.Menu.js"></script>

		<script src="../../modules/ve/ui/inspectors/ve.ui.LinkInspector.js"></script>

		<script src="../../modules/ve/ui/tools/ve.ui.ButtonTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.AnnotationButtonTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.ClearButtonTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.HistoryButtonTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.ListButtonTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.IndentationButtonTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.DropdownTool.js"></script>
		<script src="../../modules/ve/ui/tools/ve.ui.FormatDropdownTool.js"></script>
	
		<!-- sandbox -->
		<script src="../../modules/sandbox/sandbox.js"></script>
	</body>
</html>
