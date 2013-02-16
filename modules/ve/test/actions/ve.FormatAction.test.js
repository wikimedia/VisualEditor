/*!
 * VisualEditor Actions FormatAction tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.FormatAction' );

/* Tests */

function runFormatConverterTest( assert, range, type, attributes, expectedSelection, expectedData, msg ) {
	var selection,
		dom = ve.createDocumentFromHTML( ve.dm.example.isolationHTML ),
		surface = new ve.Surface( new ve.init.Target( $( '<div>' ) ), dom ),
		formatAction = new ve.FormatAction( surface ),
		data = ve.copyArray( surface.getModel().getDocument().getFullData() ),
		originalData = ve.copyArray( data );

	expectedData( data );

	surface.getModel().change( null, range );
	formatAction.convert( type, attributes );

	assert.deepEqual( surface.getModel().getDocument().getFullData(), data, msg + ': data models match' );
	assert.deepEqual( surface.getModel().getSelection(), expectedSelection, msg + ': selections match' );

	selection = surface.getModel().undo();

	assert.deepEqual( surface.getModel().getDocument().getFullData(), originalData, msg + ' (undo): data models match' );
	assert.deepEqual( selection, range, msg + ' (undo): selections match' );

	surface.destroy();
}

QUnit.test( 'convert', function ( assert ) {
	var i,
		cases = [
			{
				'range': new ve.Range( 14, 16 ),
				'type': 'MWheading',
				'attributes': { level: 2 },
				'expectedSelection': new ve.Range( 14, 16 ),
				'expectedData': function( data ) {
					data.splice( 11, 2, { 'type': '/list' }, { 'type': 'MWheading', 'attributes': { 'level': 2 } } );
					data.splice( 19, 2, { 'type': '/MWheading' }, { 'type': 'list', 'attributes': { 'style': 'bullet' } } );
				},
				'msg': 'converting partial selection of list item "Item 2" to level 2 MWheading'
			},
			{
				'range': new ve.Range( 15, 50 ),
				'type': 'MWheading',
				'attributes': { level: 3 },
				'expectedSelection': new ve.Range( 15, 44 ),
				'expectedData': function( data ) {
					data.splice( 11, 2, { 'type': '/list' }, { 'type': 'MWheading', 'attributes': { 'level': 3 } } );
					data.splice( 19, 4, { 'type': '/MWheading' }, { 'type': 'MWheading', 'attributes': { 'level': 3 } } );
					data.splice( 27, 4, { 'type': '/MWheading' }, { 'type': 'MWheading', 'attributes': { 'level': 3 } } );
					data.splice( 38, 4, { 'type': '/MWheading' }, { 'type': 'MWheading', 'attributes': { 'level': 3 } } );
					data.splice( 46, 2, { 'type': '/MWheading' }, { 'type': 'list', 'attributes': { 'style': 'bullet' } } );
				},
				'msg': 'converting partial selection across two lists surrounding a paragraph'
			},
			{
				'range': new ve.Range( 4, 28 ),
				'type': 'MWheading',
				'attributes': { level: 1 },
				'expectedSelection': new ve.Range( 2, 22 ),
				'expectedData': function( data ) {
					data.splice( 0, 3, { 'type': 'MWheading', 'attributes': { 'level': 1 } } );
					data.splice( 7, 4, { 'type': '/MWheading' }, { 'type': 'MWheading', 'attributes': { 'level': 1 } } );
					data.splice( 15, 4, { 'type': '/MWheading' }, { 'type': 'MWheading', 'attributes': { 'level': 1 } } );
					data.splice( 23, 3, { 'type': '/MWheading' } );
				},
				'msg': 'converting partial selection of all list items to level 1 MWheadings'
			},
			{
				'range': new ve.Range( 5, 26 ),
				'type': 'MWpreformatted',
				'attributes': undefined,
				'expectedSelection': new ve.Range( 3, 20 ),
				'expectedData': function( data ) {
					data.splice( 0, 3, { 'type': 'MWpreformatted' } );
					data.splice( 7, 4, { 'type': '/MWpreformatted' }, { 'type': 'MWpreformatted' } );
					data.splice( 15, 4, { 'type': '/MWpreformatted' }, { 'type': 'MWpreformatted' } );
					data.splice( 23, 3, { 'type': '/MWpreformatted' } );
				},
				'msg': 'converting partial selection of some list items to MWpreformatted text'
			},
			{
				'range': new ve.Range( 146, 159 ),
				'type': 'paragraph',
				'attributes': undefined,
				'expectedSelection': new ve.Range( 146, 159 ),
				'expectedData': function( data ) {
					data.splice( 145, 1, { 'type': 'paragraph' } );
					data.splice( 159, 1, { 'type': '/paragraph' } );
				},
				'msg': 'converting heading in list item to paragraph'
			},
			{
				'range': new ve.Range( 165, 180 ),
				'type': 'paragraph',
				'attributes': undefined,
				'expectedSelection': new ve.Range( 165, 180 ),
				'expectedData': function( data ) {
					data.splice( 162, 1, { 'type': 'paragraph' } );
					data.splice( 183, 1, { 'type': '/paragraph' } );
				},
				'msg': 'converting MWpreformatted in list item to paragraph'
			}
		];

	QUnit.expect( cases.length * 4 );
	for ( i = 0; i < cases.length; i++ ) {
		runFormatConverterTest( assert, cases[i].range, cases[i].type, cases[i].attributes, cases[i].expectedSelection, cases[i].expectedData, cases[i].msg );
	}
} );
