/*!
 * VisualEditor UserInterface UrlStringTransferHandler tests.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ui.UrlStringTransferHandler' );

/* Tests */

function runUrlStringHandlerTest( assert, string, mimeType, expectedData ) {
	var handler,
		done = assert.async(),
		item = ve.ui.DataTransferItem.static.newFromString( string, mimeType ),
		doc = ve.dm.example.createExampleDocument(),
		mockSurface = {
			getModel: function () {
				return {
					getDocument: function () {
						return doc;
					}
				};
			},
			getImportRules: function () {
				return ve.init.mw.Target.static.importRules;
			}
		},
		linkAction = ve.ui.actionFactory.create( 'link', mockSurface ),
		makeLinkAnnotation = function ( href ) {
			return linkAction.getLinkAnnotation( href ).element;
		};

	handler = ve.ui.dataTransferHandlerFactory.create( 'urlString', mockSurface, item );

	handler.getInsertableData().done( function ( actualData ) {
		ve.dm.example.postprocessAnnotations( actualData, doc.getStore() );
		assert.equalLinearData( actualData, expectedData( makeLinkAnnotation ), 'data match' );
		done();
	} );
}

QUnit.test( 'simple external link', 1, function ( assert ) {
	runUrlStringHandlerTest( assert, 'http://example.com', 'text/plain', function ( makeAnnotation ) {
		var a = makeAnnotation( 'http://example.com' );
		return [
			[ 'h', [ a ] ],
			[ 't', [ a ] ],
			[ 't', [ a ] ],
			[ 'p', [ a ] ],
			[ ':', [ a ] ],
			[ '/', [ a ] ],
			[ '/', [ a ] ],
			[ 'e', [ a ] ],
			[ 'x', [ a ] ],
			[ 'a', [ a ] ],
			[ 'm', [ a ] ],
			[ 'p', [ a ] ],
			[ 'l', [ a ] ],
			[ 'e', [ a ] ],
			[ '.', [ a ] ],
			[ 'c', [ a ] ],
			[ 'o', [ a ] ],
			[ 'm', [ a ] ],
			' '
		];
	} );
} );

QUnit.test( 'DnD standard URI list', 1, function ( assert ) {
	runUrlStringHandlerTest( assert, '#comment\nhttp://example.com\n', 'text/uri-list', function ( makeAnnotation ) {
		var a = makeAnnotation( 'http://example.com' );
		return [
			[ 'h', [ a ] ],
			[ 't', [ a ] ],
			[ 't', [ a ] ],
			[ 'p', [ a ] ],
			[ ':', [ a ] ],
			[ '/', [ a ] ],
			[ '/', [ a ] ],
			[ 'e', [ a ] ],
			[ 'x', [ a ] ],
			[ 'a', [ a ] ],
			[ 'm', [ a ] ],
			[ 'p', [ a ] ],
			[ 'l', [ a ] ],
			[ 'e', [ a ] ],
			[ '.', [ a ] ],
			[ 'c', [ a ] ],
			[ 'o', [ a ] ],
			[ 'm', [ a ] ],
			' '
		];
	} );
} );

QUnit.test( 'Mozilla URI list', 1, function ( assert ) {
	runUrlStringHandlerTest( assert, 'http://example.com\n[[Foo]]', 'text/x-moz-url', function ( makeAnnotation ) {
		var a = makeAnnotation( 'http://example.com' );
		return [
			[ '[', [ a ] ],
			[ '[', [ a ] ],
			[ 'F', [ a ] ],
			[ 'o', [ a ] ],
			[ 'o', [ a ] ],
			[ ']', [ a ] ],
			[ ']', [ a ] ],
			' '
		];
	} );
} );
