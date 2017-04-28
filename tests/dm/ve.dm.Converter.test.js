/*!
 * VisualEditor DataModel Converter tests.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
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
