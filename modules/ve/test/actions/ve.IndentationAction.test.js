/*!
 * VisualEditor Actions IndentationAction tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.IndentationAction' );

/* Tests */

function runIndentationTest( assert, range, method, expectedSelection, expectedData, label ) {
	var dom = ve.createDocumentFromHTML( ve.dm.example.isolationHTML ),
		surface = new ve.Surface( $('<div>'),  dom ),
		indentationAction = new ve.IndentationAction( surface ),
		data = ve.copyArray( surface.getModel().getDocument().getFullData() );

	surface.getModel().change( null, range );
	indentationAction[method]();

	expectedData( data );

	assert.deepEqual( surface.getModel().getDocument().getFullData(), data, label + ': data models match' );
	assert.deepEqual( surface.getModel().getSelection(), expectedSelection, label + ': selections match' );

	surface.destroy();
}

QUnit.test( 'decrease', 2, function ( assert ) {
	var rebuilt = { 'changed': { 'rebuilt': 1 } },
		createdAndRebuilt = { 'changed': { 'created': 2, 'rebuilt': 1 } };

	runIndentationTest( assert, new ve.Range( 14, 16 ), 'decrease', new ve.Range( 14, 16 ), function( data ) {
		data[0].internal = rebuilt;
		data.splice( 11, 2, { 'type': '/list' }, { 'type': 'paragraph' } );
		data.splice( 19, 2, { 'type': '/paragraph' }, { 'type': 'list', 'attributes': { 'style': 'bullet' }, 'internal': createdAndRebuilt } );
	}, 'decrease indentation on partial selection of list item "Item 2"' );
} );
