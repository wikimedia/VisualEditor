/*!
 * VisualEditor DataModel Converter tests.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.dm.Converter' );

/* Tests */

QUnit.test( 'getModelFromDom', function ( assert ) {
	var msg, cases = ve.dm.example.domToDataCases;

	for ( msg in cases ) {
		ve.test.utils.runGetModelFromDomTest( assert, ve.copy( cases[ msg ] ), msg );
	}
} );

QUnit.test( 'getDomFromModel', function ( assert ) {
	var msg, cases = ve.dm.example.domToDataCases;

	for ( msg in cases ) {
		ve.test.utils.runGetDomFromModelTest( assert, ve.copy( cases[ msg ] ), msg );
	}
} );

QUnit.test( 'roundTripMetadata', function ( assert ) {
	var doc, tx,
		beforeHtml = '<p>ab<meta foo="x">cd</p><p>ef<meta foo="y">gh</p>',
		afterHtml = '<p>abc</p><meta foo="x"><p>ef<meta foo="y">gh</p>';

	assert.expect( 2 );
	doc = ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( beforeHtml ) );
	tx = ve.dm.TransactionBuilder.static.newFromRemoval( doc, new ve.Range( 4, 5 ) );
	doc.commit( tx );
	assert.equal(
		ve.dm.converter.getDomFromModel( doc ).body.innerHTML,
		afterHtml,
		'Metadata in ContentBranchNode gets moved outside by change to ContentBranchNode'
	);
	doc.commit( tx.reversed() );
	assert.equal(
		ve.dm.converter.getDomFromModel( doc ).body.innerHTML,
		beforeHtml,
		'Undo restores metadata to inside ContentBranchNode'
	);
} );
