/**
 * VisualEditor data model Converter tests.
 * 
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

module( 've.dm.Converter' );

/* Tests */

test( 'getDataElementFromDomElement', function() {
	for ( var msg in ve.dm.example.conversions ) {
		var conversion = ve.dm.example.conversions[msg];
		deepEqual(
			ve.dm.converter.getDataElementFromDomElement( conversion.domElement ),
			conversion.dataElement,
			msg
		);
	}
} );

test( 'getDomElementFromDataElement', function() {
	for ( var msg in ve.dm.example.conversions ) {
		var conversion = ve.dm.example.conversions[msg];
		deepEqual(
			ve.example.getDomElementSummary(
				ve.dm.converter.getDomElementFromDataElement( conversion.dataElement )
			),
			ve.example.getDomElementSummary( conversion.domElement ),
			msg
		);
	}
} );

test( 'getDataFromDom', function() {
	var cases = ve.dm.example.domToDataCases;
	for ( var msg in cases ) {
		deepEqual(
			ve.dm.converter.getDataFromDom( $( '<div></div>' ).html( cases[msg].html )[0] ),
			cases[msg].data,
			msg
		);
	}
} );

test( 'getDomFromData', function() {
	var cases = ve.dm.example.domToDataCases;
	for ( var msg in cases ) {
		deepEqual(
			ve.example.getDomElementSummary( ve.dm.converter.getDomFromData( cases[msg].data ) ),
			ve.example.getDomElementSummary( $( '<div></div>' ).html( cases[msg].html )[0] ),
			msg
		);
	}
});
