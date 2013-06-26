/*!
 * VisualEditor DataModel Converter tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.dm.Converter' );

/* Tests */

ve.test.runGetDataFromDomTests = function( assert, cases ) {
	var msg, doc, store, internalList, i, length, hash, n = 0;

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
			doc = new ve.dm.Document( [] );
			store = doc.getStore();
			internalList = doc.getInternalList();
			ve.dm.example.preprocessAnnotations( cases[msg].data, store );
			assert.deepEqualWithDomElements(
				ve.dm.converter.getDataFromDom(
					ve.createDocumentFromHtml( cases[msg].html ), store, internalList
				).getData(),
				cases[msg].data,
				msg
			);
			// check storeItems have been added to store
			if ( cases[msg].storeItems ) {
				for ( i = 0, length = cases[msg].storeItems.length; i < length; i++ ) {
					hash = cases[msg].storeItems[i].hash || ve.getHash( cases[msg].storeItems[i].value );
					assert.deepEqualWithDomElements(
						store.value( store.indexOfHash( hash ) ),
						cases[msg].storeItems[i].value,
						msg + ': store item ' + i + ' found'
					);
				}
			}
		}
	}
};

ve.test.runGetDomFromDataTests = function( assert, cases ) {
	var msg, originalData, doc, store, i, length, n = 0;

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
		if ( cases[msg].modify ) {
			cases[msg].modify( cases[msg].data );
		}
		doc = new ve.dm.Document( ve.dm.example.preprocessAnnotations( cases[msg].data, store ) );
		originalData = ve.copyArray( doc.getFullData() );
		assert.equalDomElement(
			ve.dm.converter.getDomFromData( doc.getFullData(), doc.getStore(), doc.getInternalList() ),
			ve.createDocumentFromHtml( cases[msg].normalizedHtml || cases[msg].html ),
			msg
		);
		assert.deepEqualWithDomElements( doc.getFullData(), originalData, msg + ' (data hasn\'t changed)' );
	}
};

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
	ve.test.runGetDataFromDomTests( assert, ve.copyObject( ve.dm.example.domToDataCases ) );
} );

QUnit.test( 'getDomFromData', function ( assert ) {
	ve.test.runGetDomFromDataTests( assert, ve.copyObject( ve.dm.example.domToDataCases ) );
} );
