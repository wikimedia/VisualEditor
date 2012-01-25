$(document).ready( function() {
	window.wikiDom = {
		'type': 'document',
		'children': [
			{
				'type': 'paragraph',
				'content': {
					'text': 'Barack Hussein Obama II is the 44th   and current President of the United States. He is the first African American to hold the office. Obama previously served as a United States Senator from Illinois, from January 2005 until he resigned following his victory in the 2008 presidential election.',
					'annotations': [
						{
							'type': 'textStyle/bold',
							'range': {
								'start': 7,
								'end': 14
							}
						},
						{
							'type': 'object/template',
							'data': {
								'html': '<sup><small>[<a href="#">citation needed</a>]</small></sup>'
							},
							'range': {
								'start': 36,
								'end': 37
							}
						}
					]
				}
			},
			{
				'type': 'paragraph',
				'content': { 'text': 'Born in Honolulu, Hawaii, Obama is a graduate of Columbia University and Harvard Law School, where he was the president of the Harvard Law Review. He was a community organizer in Chicago before earning his law degree. He worked as a civil rights attorney in Chicago and taught constitutional law at the University of Chicago Law School from 1992 to 2004. He served three terms representing the 13th District in the Illinois Senate from 1997 to 2004.' }
			}
		]
	};
	
	window.documentModel = es.DocumentModel.newFromPlainObject( window.wikiDom );
	window.surfaceModel = new es.SurfaceModel( window.documentModel );
	window.surfaceView = new es.SurfaceView( $( '#es-editor' ), window.surfaceModel );


	$('#es-editor')[0].addEventListener("DOMSubtreeModified", function() {
		var selection = rangy.getSelection();
		console.log(selection);
		if(selection.anchorNode === selection.focusNode && selection.anchorOffset === selection.focusOffset) {
			$node = $(selection.anchorNode);
			while(!$node.hasClass('es-paragraphView')) {
				$node = $node.parent();
			}
			console.log($node.data('view'));
			console.log(selection);
		}
	});


	/*
	$('#es-editor')[0].addEventListener("DOMSubtreeModified", function() {
		var selection = rangy.getSelection();
		console.log(selection);
		if(selection.anchorNode === selection.focusNode && selection.anchorOffset === selection.focusOffset) {
			$node = $(selection.anchorNode);
			while(!$node.hasClass('es-paragraphView')) {
				$node = $node.parent();
			}
			var newText = $node[0].textContent;
			var view = $node.data('view');
			var offset = surfaceView.documentView.getOffsetFromNode(view);
			var oldText = documentModel.getContentText(new es.Range(offset, offset + 1 + view.getContentLength()));

			newText = newText.replace(/\xA0/g,' ');
			oldText = oldText.replace(/\xA0/g,' ');

			if(newText.length > oldText.length) {
				for( var i = 0; i < oldText.length; i++ ) {
					if(newText[i] !== oldText[i]) {
						var differenceStart = i;
						break;
					}
				}

				for( var i = oldText.length - 1; i >= 0; i--) {
					if(newText[i + newText.length - oldText.length] !== oldText[i]) {
						var differenceStop = i;
						break;
					}
				}
				
				var tx = documentModel.prepareRemoval(new es.Range(1+differenceStart,1+1+differenceStop));
				documentModel.commit(tx);
				var difference = newText.substring(differenceStart, 1+differenceStop + newText.length - oldText.length);
				var tx = documentModel.prepareInsertion(differenceStart+1, difference.split());
				documentModel.commit(tx);


				
			}
		}
	});

	$('#es-editor')[0].addEventListener("DOMCharacterDataModified", function() {
	});
	*/
	refreshPreview();
	setInterval(refreshPreview, 500);
} );

function refreshPreview() {
	$('#es-preview').text( es.WikitextSerializer.stringify( window.documentModel.getPlainObject() ) );
}
