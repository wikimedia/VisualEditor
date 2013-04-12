/*!
 * VisualEditor DataModel Converter tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.dm.Converter' );

/* Tests */

// TODO rewrite to test getDataElementOrAnnotationFromDomElement
/*
QUnit.test( 'getDataElementFromDomElement', 20, function ( assert ) {
	var msg, conversion;

	for ( msg in ve.dm.example.conversions ) {
		conversion = ve.dm.example.conversions[msg];
		assert.deepEqual(
			ve.dm.converter.getDataElementFromDomElement( conversion.domElement ),
			conversion.dataElement,
			msg
		);
	}
} );
*/

QUnit.test( 'getDomElementsFromDataElement', 20, function ( assert ) {
	var msg, conversion, doc;

	for ( msg in ve.dm.example.conversions ) {
		conversion = ve.dm.example.conversions[msg];
		doc = conversion.domElement.ownerDocument;
		assert.equalDomElement(
			ve.dm.converter.getDomElementsFromDataElement( conversion.dataElement, doc )[0],
			conversion.domElement,
			msg
		);
	}
} );

QUnit.test( 'getDataFromDom', 52, function ( assert ) {
	var msg,
		store = new ve.dm.IndexValueStore(),
		cases = ve.copyObject( ve.dm.example.domToDataCases );

	// TODO: this is a hack to make normal heading/preformatted
	// nodes the most recently registered, instead of the MW versions
	ve.dm.modelRegistry.register( ve.dm.HeadingNode );
	ve.dm.modelRegistry.register( ve.dm.PreformattedNode );

	for ( msg in cases ) {
		if ( cases[msg].html !== null ) {
			ve.dm.example.preprocessAnnotations( cases[msg].data, store );
			assert.deepEqual(
				ve.dm.converter.getDataFromDom( store, ve.createDocumentFromHTML( cases[msg].html ) ).getData(),
				cases[msg].data,
				msg
			);
		}
	}
} );

QUnit.test( 'getDomFromData', 56, function ( assert ) {
	var msg,
		store = new ve.dm.IndexValueStore(),
		cases = ve.copyObject( ve.dm.example.domToDataCases );

	for ( msg in cases ) {
		ve.dm.example.preprocessAnnotations( cases[msg].data, store );
		assert.equalDomElement(
			ve.dm.converter.getDomFromData( store, cases[msg].data ),
			ve.createDocumentFromHTML( cases[msg].normalizedHtml || cases[msg].html ),
			msg
		);
	}
} );
