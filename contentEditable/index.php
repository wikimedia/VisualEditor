<!DOCTYPE html>

<html>
	<head>
		<title>EditSurface + ContentEditable Demo</title>
		<style>
/* Mozilla based browsers */
::-moz-selection {
       background-color: #b3d6f6;
       color: #000;
}

/* Works in Safari */
::selection {
       background-color: #b3d6f6;
       color: #000;
}
.es-contentView-ruler {
	position: absolute;
	top: 0;
	left: 0;
	display: inline-block;
	z-index: -1000;
}
.es-paragraphView {
	margin-bottom: 20px;
}
#es-preview {
	font-family: monospace,"Courier New";
	white-space: pre-wrap;
}
.es-contentView-format-textStyle-italic,
.es-contentView-format-textStyle-emphasize {
	font-style: italic;
}

.es-contentView-format-textStyle-bold,
.es-contentView-format-textStyle-strong {
	font-weight: bold;
}
		</style>
	</head>
	<body>
		<script src="diff_match_patch.js"></script>
		
		<!-- Rangy -->
		<script src="rangy/rangy-core.js"></script>
		<script src="rangy/rangy-cssclassapplier.js"></script>
		<script src="rangy/rangy-selectionsaverestore.js"></script>
		<script src="rangy/rangy-serializer.js"></script>
		
		<!-- EditSurface -->
		<script src="../modules/jquery/jquery.js"></script>
		<script src="../modules/es/es.js"></script>
		<script src="../modules/es/es.Html.js"></script>
		<script src="../modules/es/es.Position.js"></script>
		<script src="../modules/es/es.Range.js"></script>
		<script src="../modules/es/es.TransactionProcessor.js"></script>

		<!-- Serializers -->
		<script src="../modules/es/serializers/es.AnnotationSerializer.js"></script>
		<script src="../modules/es/serializers/es.HtmlSerializer.js"></script>
		<script src="../modules/es/serializers/es.JsonSerializer.js"></script>
		<script src="../modules/es/serializers/es.WikitextSerializer.js"></script>

		<!-- Bases -->
		<script src="../modules/es/bases/es.EventEmitter.js"></script>
		<script src="../modules/es/bases/es.DocumentNode.js"></script>
		<script src="../modules/es/bases/es.DocumentModelNode.js"></script>
		<script src="../modules/es/bases/es.DocumentBranchNode.js"></script>
		<script src="../modules/es/bases/es.DocumentLeafNode.js"></script>
		<script src="../modules/es/bases/es.DocumentModelBranchNode.js"></script>
		<script src="../modules/es/bases/es.DocumentModelLeafNode.js"></script>
		<script src="../modules/es/bases/es.DocumentViewNode.js"></script>
		<script src="../modules/es/bases/es.DocumentViewBranchNode.js"></script>
		<script src="views/es.DocumentViewLeafNode.js"></script>
		<script src="../modules/es/bases/es.Inspector.js"></script>
		<script src="../modules/es/bases/es.Tool.js"></script>

		<!-- Models -->
		<script src="../modules/es/models/es.SurfaceModel.js"></script>
		<script src="../modules/es/models/es.DocumentModel.js"></script>
		<script src="../modules/es/models/es.ParagraphModel.js"></script>
		<script src="../modules/es/models/es.PreModel.js"></script>
		<script src="../modules/es/models/es.ListModel.js"></script>
		<script src="../modules/es/models/es.ListItemModel.js"></script>
		<script src="../modules/es/models/es.TableModel.js"></script>
		<script src="../modules/es/models/es.TableRowModel.js"></script>
		<script src="../modules/es/models/es.TableCellModel.js"></script>
		<script src="../modules/es/models/es.HeadingModel.js"></script>
		<script src="../modules/es/models/es.TransactionModel.js"></script>

		<!-- Inspectors -->
		<script src="../modules/es/inspectors/es.LinkInspector.js"></script>

		<!-- Tools -->
		<script src="../modules/es/tools/es.ButtonTool.js"></script>
		<script src="../modules/es/tools/es.AnnotationButtonTool.js"></script>
		<script src="../modules/es/tools/es.ClearButtonTool.js"></script>
		<script src="../modules/es/tools/es.HistoryButtonTool.js"></script>
		<script src="../modules/es/tools/es.ListButtonTool.js"></script>
		<script src="../modules/es/tools/es.IndentationButtonTool.js"></script>
		<script src="../modules/es/tools/es.DropdownTool.js"></script>
		<script src="../modules/es/tools/es.FormatDropdownTool.js"></script>

		<!-- Views -->
		<!--
		<script src="../modules/es/views/es.SurfaceView.js"></script>
		<script src="../modules/es/views/es.ToolbarView.js"></script>
		<script src="../modules/es/views/es.ContentView.js"></script>
		<script src="../modules/es/views/es.ContextView.js"></script>
		<script src="../modules/es/views/es.DocumentView.js"></script>
		<script src="../modules/es/views/es.ParagraphView.js"></script>
		<script src="../modules/es/views/es.PreView.js"></script>
		<script src="../modules/es/views/es.ListView.js"></script>
		<script src="../modules/es/views/es.MenuView.js"></script>
		<script src="../modules/es/views/es.ListItemView.js"></script>
		<script src="../modules/es/views/es.TableView.js"></script>
		<script src="../modules/es/views/es.TableRowView.js"></script>
		<script src="../modules/es/views/es.TableCellView.js"></script>
		<script src="../modules/es/views/es.HeadingView.js"></script>
		-->
		<script src="views/es.SurfaceView.js"></script>
		<script src="views/es.ContentView.js"></script>
		<script src="views/es.DocumentView.js"></script>
		<script src="views/es.ParagraphView.js"></script>
		

		<!-- Demo -->
		<script src="main.js"></script>
		
		<table style="margin: auto; width: 1000px; border: solid 1px;">
			<tr>
				<td style="width: 500px; vertical-align: top; padding: 10px;">
					<div id="es-editor"></div>
				</td>
				<td style="width: 500px; vertical-align: top; padding: 10px;">
					<div id="es-preview"></div>
				</td>
			</tr>
		</table>
		
		
	</body>
</html>
