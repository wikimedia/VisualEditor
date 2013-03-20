/*!
 * VisualEditor Actions FormatAction tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.FormatAction' );

/* Tests */

function runConverterTest( assert, range, type, attributes, expectedSelection, expectedData, label ) {
	var dom = ve.createDocumentFromHTML( ve.dm.example.isolationHTML ),
		surface = new ve.Surface( new ve.init.Target( $( '<div>' ) ), dom ),
		formatAction = new ve.FormatAction( surface ),
		data = ve.copyArray( surface.getModel().getDocument().getFullData() );

	surface.getModel().change( null, range );
	formatAction.convert( type, attributes );

	expectedData( data );

	assert.deepEqual( surface.getModel().getDocument().getFullData(), data, label + ': data models match' );
	assert.deepEqual( surface.getModel().getSelection(), expectedSelection, label + ': selections match' );

	surface.destroy();
}

QUnit.test( 'convert', 12, function ( assert ) {
	var rebuilt = { 'changed': { 'rebuilt': 1 } },
		created = { 'changed': { 'created': 1 } },
		createdAndRebuilt = { 'changed': { 'created': 1, 'rebuilt': 1 } };

	runConverterTest( assert, new ve.Range( 14, 16 ), 'MWheading', { level: 2 }, new ve.Range( 14, 16 ), function( data ) {
		data[0].internal = rebuilt;
		data.splice( 11, 2, { 'type': '/list' }, { 'type': 'MWheading', 'attributes': { 'level': 2 }, 'internal': created } );
		data.splice( 19, 2, { 'type': '/MWheading' }, { 'type': 'list', 'attributes': { 'style': 'bullet' }, 'internal': createdAndRebuilt } );
	}, 'converting partial selection of list item "Item 2" to level 2 MWheading' );

	runConverterTest( assert, new ve.Range( 15, 50 ), 'MWheading', { level: 3 }, new ve.Range( 15, 44 ), function( data ) {
		data[0].internal = rebuilt;
		data.splice( 11, 2, { 'type': '/list' }, { 'type': 'MWheading', 'attributes': { 'level': 3 }, 'internal': created } );
		data.splice( 19, 4, { 'type': '/MWheading' }, { 'type': 'MWheading', 'attributes': { 'level': 3 }, 'internal': created } );
		data.splice( 27, 4, { 'type': '/MWheading' }, { 'type': 'MWheading', 'attributes': { 'level': 3 }, 'internal': created } );
		data.splice( 38, 4, { 'type': '/MWheading' }, { 'type': 'MWheading', 'attributes': { 'level': 3 }, 'internal': created } );
		data.splice( 46, 2, { 'type': '/MWheading' }, { 'type': 'list', 'attributes': { 'style': 'bullet' }, 'internal': created } );
	}, 'converting partial selection across two lists surrounding a paragraph' );

	runConverterTest( assert, new ve.Range( 4, 28 ), 'MWheading', { level: 1 }, new ve.Range( 2, 22 ), function( data ) {
		data[0].internal = rebuilt;
		data.splice( 0, 3, { 'type': 'MWheading', 'attributes': { 'level': 1 }, 'internal': created } );
		data.splice( 7, 4, { 'type': '/MWheading' }, { 'type': 'MWheading', 'attributes': { 'level': 1 }, 'internal': created } );
		data.splice( 15, 4, { 'type': '/MWheading' }, { 'type': 'MWheading', 'attributes': { 'level': 1 }, 'internal': created } );
		data.splice( 23, 3, { 'type': '/MWheading' } );
	}, 'converting partial selection of all list items to level 1 MWheadings' );

	runConverterTest( assert, new ve.Range( 5, 26 ), 'MWpreformatted', undefined, new ve.Range( 3, 20 ), function( data ) {
		data[0].internal = rebuilt;
		data.splice( 0, 3, { 'type': 'MWpreformatted', 'internal': created } );
		data.splice( 7, 4, { 'type': '/MWpreformatted' }, { 'type': 'MWpreformatted', 'internal': created } );
		data.splice( 15, 4, { 'type': '/MWpreformatted' }, { 'type': 'MWpreformatted', 'internal': created } );
		data.splice( 23, 3, { 'type': '/MWpreformatted' } );
	}, 'converting partial selection of some list items to MWpreformatted text' );

	runConverterTest( assert, new ve.Range( 146, 159 ), 'paragraph', undefined, new ve.Range( 146, 159 ), function( data ) {
		data.splice( 145, 1, { 'type': 'paragraph', 'internal': created } );
		data.splice( 159, 1, { 'type': '/paragraph' } );
	}, 'converting heading in list item to paragraph' );

	runConverterTest( assert, new ve.Range( 165, 180 ), 'paragraph', undefined, new ve.Range( 165, 180 ), function( data ) {
		data.splice( 162, 1, { 'type': 'paragraph', 'internal': created } );
		data.splice( 183, 1, { 'type': '/paragraph' } );
	}, 'converting MWpreformatted in list item to paragraph' );

} );
