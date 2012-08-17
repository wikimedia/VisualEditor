/**
 * VisualEditor data model SurfaceFragment tests.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.dm.SurfaceFragment' );

// Tests

QUnit.test( 'constructor', 8, function ( assert ) {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		surface = new ve.dm.Surface( doc ),
		fragment = new ve.dm.SurfaceFragment( surface );
	// Default range and autoSelect
	assert.strictEqual( fragment.getSurface(), surface, 'surface reference is stored' );
	assert.strictEqual( fragment.getDocument(), doc, 'document reference is stored' );
	assert.deepEqual( fragment.getRange(), new ve.Range( 0, 0 ), 'range is taken from surface' );
	assert.strictEqual( fragment.willAutoSelect(), false, 'autoSelect defaults to false' );
	assert.strictEqual( fragment.isNull(), false, 'valid fragment is not null' );
	// Invalid range and autoSelect
	fragment = new ve.dm.SurfaceFragment( surface, new ve.Range( -100, 100 ), 'truthy' );
	assert.equal( fragment.getRange().from, 0, 'range is clamped between 0 and document length' );
	assert.equal( fragment.getRange().to, 61, 'range is clamped between 0 and document length' );
	assert.strictEqual( fragment.willAutoSelect(), true, 'autoSelect values are cast to boolean' );
} );

QUnit.test( 'onTransact', 1, function ( assert ) {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		surface = new ve.dm.Surface( doc ),
		fragment1 = new ve.dm.SurfaceFragment( surface, new ve.Range( 1, 56 ) ),
		fragment2 = new ve.dm.SurfaceFragment( surface, new ve.Range( 2, 4 ) );
	fragment1.removeContent();
	assert.deepEqual(
		fragment2.getRange(),
		new ve.Range( 1, 1 ),
		'fragment ranges are auto-translated when transactions are processed'
	);
} );

QUnit.test( 'adjustRange', 3, function ( assert ) {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		surface = new ve.dm.Surface( doc ),
		fragment = new ve.dm.SurfaceFragment( surface, new ve.Range( 20, 21 ) ),
		adjustedFragment = fragment.adjustRange( -19, 35 );
	assert.ok( fragment !== adjustedFragment, 'adjustRange produces a new fragment' );
	assert.deepEqual( fragment.getRange(), new ve.Range( 20, 21 ), 'old fragment is not changed' );
	assert.deepEqual( adjustedFragment.getRange(), new ve.Range( 1, 56 ), 'new range is used' );
} );

QUnit.test( 'collapseRange', 3, function ( assert ) {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		surface = new ve.dm.Surface( doc ),
		fragment = new ve.dm.SurfaceFragment( surface, new ve.Range( 20, 21 ) ),
		collapsedFragment = fragment.collapseRange();
	assert.ok( fragment !== collapsedFragment, 'collapseRange produces a new fragment' );
	assert.deepEqual( fragment.getRange(), new ve.Range( 20, 21 ), 'old fragment is not changed' );
	assert.deepEqual( collapsedFragment.getRange(), new ve.Range( 20, 20 ), 'new range is used' );
} );

QUnit.test( 'expandRange', 1, function ( assert ) {
	var doc = new ve.dm.Document( ve.dm.example.data ),
		surface = new ve.dm.Surface( doc ),
		fragment = new ve.dm.SurfaceFragment( surface, new ve.Range( 20, 21 ) );
	assert.strictEqual(
		fragment.expandRange( 'closest', 'invalid type' ).isNull(),
		true,
		'closest with invalid type results in null fragment'
	);
} );

