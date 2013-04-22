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

QUnit.test( 'getDataFromDom', function ( assert ) {
	var msg, store, i, length, hash, n = 0,
		cases = ve.copyObject( ve.dm.example.domToDataCases );

	// TODO: this is a hack to make normal heading/preformatted
	// nodes the most recently registered, instead of the MW versions
	ve.dm.modelRegistry.register( ve.dm.HeadingNode );
	ve.dm.modelRegistry.register( ve.dm.PreformattedNode );

	for ( msg in cases ) {
		if ( cases[msg].html !== null ) {
			n++;
			if ( cases[msg].storeItems ) {
				n += cases[msg].storeItems.length;
			}
		}
	}
	QUnit.expect( n );

	for ( msg in cases ) {
		if ( cases[msg].html !== null ) {
			store = new ve.dm.IndexValueStore();
			ve.dm.example.preprocessAnnotations( cases[msg].data, store );
			assert.deepEqual(
				ve.dm.converter.getDataFromDom( store, ve.createDocumentFromHTML( cases[msg].html ) ).getData(),
				cases[msg].data,
				msg
			);
			// check storeItems have been added to store
			if ( cases[msg].storeItems ) {
				for ( i = 0, length = cases[msg].storeItems.length; i < length; i++ ) {
					hash = cases[msg].storeItems[i].hash || ve.getHash( cases[msg].storeItems[i].value );
					assert.deepEqual(
						store.value( store.indexOfHash( hash ) ),
						cases[msg].storeItems[i].value,
						msg + ': store item ' + i + ' found'
					);
				}
			}
		}
	}
} );

QUnit.test( 'getDomFromData', function ( assert ) {
	var msg, originalData, store, i, length, n = 0,
		cases = ve.copyObject( ve.dm.example.domToDataCases );

	for ( msg in cases ) {
		n++;
	}
	QUnit.expect( 2*n );

	for ( msg in cases ) {
		store = new ve.dm.IndexValueStore();
		// load storeItems into store
		if ( cases[msg].storeItems ) {
			for ( i = 0, length = cases[msg].storeItems.length; i < length; i++ ) {
				store.index( cases[msg].storeItems[i].value, cases[msg].storeItems[i].hash );
			}
		}
		// functions won't be copied by ve.copyObject
		if( ve.dm.example.domToDataCases[msg].modify ) {
			ve.dm.example.domToDataCases[msg].modify( cases[msg].data );
		}
		ve.dm.example.preprocessAnnotations( cases[msg].data, store );
		originalData = ve.copyArray( cases[msg].data );
		assert.equalDomElement(
			ve.dm.converter.getDomFromData( store, cases[msg].data ),
			ve.createDocumentFromHTML( cases[msg].normalizedHtml || cases[msg].html ),
			msg
		);
		assert.deepEqual( cases[msg].data, originalData, msg + ' (data hasn\'t changed)' );
	}
} );
