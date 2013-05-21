/*!
 * VisualEditor Element tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.Element' );

/* Tests */

QUnit.test( 'getDocument', 10, function ( assert ) {
	var frameDoc, frameEl, frameDiv,
		$el = $( '#qunit-fixture' ),
		$div = $( '<div>' ),
		el = document.getElementById( 'qunit-fixture' ),
		div = document.createElement( 'div' ),
		win = window,
		doc = document,
		frame = doc.createElement( 'iframe' );

	el.appendChild( frame );
	frameDoc = ( frame.contentWindow && frame.contentWindow.document ) || frame.contentDocument;
	frameEl = frameDoc.createElement( 'span' );
	frameDoc.documentElement.appendChild( frameEl );
	frameDiv = frameDoc.createElement( 'div' );

	assert.strictEqual( ve.Element.static.getDocument( $el ), doc, 'jQuery' );
	assert.strictEqual( ve.Element.static.getDocument( $div ), doc, 'jQuery (detached)' );
	assert.strictEqual( ve.Element.static.getDocument( el ), doc, 'HTMLElement' );
	assert.strictEqual( ve.Element.static.getDocument( div ), doc, 'HTMLElement (detached)' );
	assert.strictEqual( ve.Element.static.getDocument( win ), doc, 'Window' );
	assert.strictEqual( ve.Element.static.getDocument( doc ), doc, 'HTMLDocument' );

	assert.strictEqual( ve.Element.static.getDocument( frameEl ), frameDoc, 'HTMLElement (framed)' );
	assert.strictEqual( ve.Element.static.getDocument( frameDiv ), frameDoc, 'HTMLElement (framed, detached)' );
	assert.strictEqual( ve.Element.static.getDocument( frameDoc ), frameDoc, 'HTMLDocument (framed)' );

	assert.throws( function () {
		ve.Element.static.getDocument( {} );
	}, 'Invalid' );
} );
