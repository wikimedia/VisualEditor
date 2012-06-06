module( 've.dm.Converter' );

/* Tests */

test( 'getDataElementFromHtmlElement', function() {
	for ( var msg in ve.dm.example.conversions ) {
		var conversion = ve.dm.example.conversions[msg];
		deepEqual(
			ve.dm.converter.getDataElementFromHtmlElement( conversion.htmlElement ),
			conversion.dataElement,
			msg
		);
	}
} );

test( 'getHtmlElementFromDataElement', function() {
	for ( var msg in ve.dm.example.conversions ) {
		var conversion = ve.dm.example.conversions[msg];
		deepEqual(
			ve.example.getHtmlElementSummary(
				ve.dm.converter.getHtmlElementFromDataElement( conversion.dataElement )
			),
			ve.example.getHtmlElementSummary( conversion.htmlElement ),
			msg
		);
	}
} );
