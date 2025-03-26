/*!
 * VisualEditor DataModel Converter tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.dm.Converter' );

/* Tests */

QUnit.test( 'getModelFromDom', ( assert ) => {
	const cases = ve.dm.example.domToDataCases;

	for ( const msg in cases ) {
		const caseItem = ve.copy( cases[ msg ] );
		caseItem.base = caseItem.base || ve.dm.example.baseUri;
		ve.test.utils.runGetModelFromDomTest( assert, caseItem, msg );
	}
} );

QUnit.test( 'getModelFromDom with store argument', ( assert ) => {
	const store = new ve.dm.HashValueStore();
	const model = ve.dm.converter.getModelFromDom(
		ve.createDocumentFromHtml( '<p>foo</p>' ),
		{ lang: 'en', dir: 'ltr' },
		store
	);
	assert.strictEqual( model.getStore(), store, 'Document store is reference-equal to store argument' );
} );

QUnit.test( 'getDomFromModel', ( assert ) => {
	const cases = ve.dm.example.domToDataCases;

	for ( const msg in cases ) {
		const caseItem = ve.copy( cases[ msg ] );
		caseItem.base = caseItem.base || ve.dm.example.baseUri;
		ve.test.utils.runGetDomFromModelTest( assert, caseItem, msg );
	}
} );

QUnit.test( 'getFullData', ( assert ) => {
	const cases = [
		{
			msg: 'Metadata in ContentBranchNode gets moved outside by any change',
			beforeHtml: '<p>x</p><!-- w --><meta foo="x"><p>ab<meta foo="y">cd</p><p>ef<meta foo="z">gh</p>',
			transaction: ( doc ) => ve.dm.TransactionBuilder.static.newFromRemoval( doc, new ve.Range( 13, 14 ) ),
			afterHtml: '<p>x</p><!-- w --><meta foo="x"><p>abc</p><meta foo="y"><p>ef<meta foo="z">gh</p>'
		},
		{
			msg: 'Metadata in ContentBranchNode is NOT removed when the whole node is removed',
			beforeHtml: '<p>x</p><!-- w --><meta foo="x"><p>ab<meta foo="y">cd</p><p>ef<meta foo="z">gh</p>',
			transaction: ( doc ) => ve.dm.TransactionBuilder.static.newFromRemoval( doc, new ve.Range( 7, 15 ) ),
			afterHtml: '<p>x</p><!-- w --><meta foo="x"><meta foo="y"><p>ef<meta foo="z">gh</p>',
			// BUG! <meta foo="y"> is not restored to the correct place after undoing
			// EXPECTED: Same as beforeHtml
			beforeHtmlUndo: '<p>x</p><!-- w --><meta foo="x"><p>abcd</p><meta foo="y"><p>ef<meta foo="z">gh</p>'
		},
		{
			msg: 'Removable metadata (empty annotation) in ContentBranchNode is removed by any change',
			beforeHtml: '<p>x</p><p>ab<i></i>cd</p><p>efgh</p>',
			transaction: ( doc ) => ve.dm.TransactionBuilder.static.newFromRemoval( doc, new ve.Range( 7, 8 ) ),
			afterHtml: '<p>x</p><p>abc</p><p>efgh</p>'
		},
		{
			msg: 'Removable metadata (empty annotation) in ContentBranchNode is removed when the whole node is removed',
			beforeHtml: '<p>x</p><p>ab<i></i>cd</p><p>efgh</p>',
			transaction: ( doc ) => ve.dm.TransactionBuilder.static.newFromRemoval( doc, new ve.Range( 3, 9 ) ),
			afterHtml: '<p>x</p><p>efgh</p>',
			// BUG! <i></i> is not restored
			// EXPECTED: Same as beforeHtml
			beforeHtmlUndo: '<p>x</p><p>abcd</p><p>efgh</p>'
		},
		{
			msg: 'When annotated metadata gets moved out of a ContentBranchNode, the annotations are removed',
			beforeHtml: '<p><i>ab<meta foo="x">cd</i></p>',
			transaction: ( doc ) => ve.dm.TransactionBuilder.static.newFromRemoval( doc, new ve.Range( 1, 2 ) ),
			afterHtml: '<p><i>bcd</i></p><meta foo="x">'
		}
	];

	cases.forEach( ( caseItem ) => {
		const doc = ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( caseItem.beforeHtml ) ),
			tx = caseItem.transaction( doc );

		doc.commit( tx );
		assert.strictEqual(
			ve.dm.converter.getDomFromModel( doc ).body.innerHTML,
			caseItem.afterHtml,
			caseItem.msg
		);

		doc.commit( tx.reversed() );
		assert.strictEqual(
			ve.dm.converter.getDomFromModel( doc ).body.innerHTML,
			caseItem.beforeHtmlUndo || caseItem.beforeHtml,
			caseItem.msg + ' (undo)'
		);
	} );
} );

QUnit.test( 'roundTripMetadata', ( assert ) => {
	const beforeHtml = '<!-- w --><meta foo="x"><p>ab<meta foo="y">cd</p><p>ef<meta foo="z">gh</p>',
		afterHtml = '<!-- w --><meta foo="x"><p>abc</p><meta foo="y"><p>ef<meta foo="z">gh</p>';

	const doc = ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( beforeHtml ) );
	const tx = ve.dm.TransactionBuilder.static.newFromRemoval( doc, new ve.Range( 10, 11 ) );
	doc.commit( tx );
	assert.strictEqual(
		ve.dm.converter.getDomFromModel( doc ).body.innerHTML,
		afterHtml,
		'Metadata in ContentBranchNode gets moved outside by change to ContentBranchNode'
	);
	doc.commit( tx.reversed() );
	assert.strictEqual(
		ve.dm.converter.getDomFromModel( doc ).body.innerHTML,
		beforeHtml,
		'Undo restores metadata to inside ContentBranchNode'
	);
} );
