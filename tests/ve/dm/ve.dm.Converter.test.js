/**
 * VisualEditor data model Converter tests.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

module( 've.dm.Converter' );

/* Tests */

test( 'getDataElementFromDomElement', function( assert ) {
	for ( var msg in ve.dm.example.conversions ) {
		var conversion = ve.dm.example.conversions[msg];
		assert.deepEqual(
			ve.dm.converter.getDataElementFromDomElement( conversion.domElement ),
			conversion.dataElement,
			msg
		);
	}
} );

test( 'getDomElementFromDataElement', function( assert ) {
	for ( var msg in ve.dm.example.conversions ) {
		var conversion = ve.dm.example.conversions[msg];
		assert.equalDomElement(
			ve.dm.converter.getDomElementFromDataElement( conversion.dataElement ),
			conversion.domElement,
			msg
		);
	}
} );

test( 'getDataFromDom', function( assert ) {
	var cases = ve.dm.example.domToDataCases;
	for ( var msg in cases ) {
		assert.deepEqual(
			ve.dm.converter.getDataFromDom( $( '<div></div>' ).html( cases[msg].html )[0] ),
			cases[msg].data,
			msg
		);
	}
} );

test( 'getDomFromData', function( assert ) {
	var cases = ve.dm.example.domToDataCases;
	for ( var msg in cases ) {
		assert.equalDomElement(
			ve.dm.converter.getDomFromData( cases[msg].data ),
			$( '<div></div>' ).html( cases[msg].html )[0],
			msg
		);
	}
} );
