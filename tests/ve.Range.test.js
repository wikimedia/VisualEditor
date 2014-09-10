/*!
 * VisualEditor Range tests.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.Range' );

/* Tests */

QUnit.test( 'Basic usage (clone, isCollapsed, isBackwards, getLength, equals, equalsSelection, containsOffset, containsRange)', 25, function ( assert ) {
	var range;

	range = new ve.Range( 100, 200 );
	assert.equal( range.isCollapsed(), false );
	assert.equal( range.isBackwards(), false );
	assert.equal( range.getLength(), 100 );
	assert.ok( range.equals( new ve.Range( 100, 200 ) ), 'equals matches identical range' );
	assert.ok( !range.equals( new ve.Range( 200, 100 ) ), 'equals doesn\'t match reverse range' );
	assert.ok( range.equalsSelection( new ve.Range( 200, 100 ) ), 'equalsSelection matches reverse range' );
	assert.ok( !range.containsOffset( 99 ), 'doesn\'t contain 50' );
	assert.ok( range.containsOffset( 100 ), 'contains 150' );
	assert.ok( range.containsOffset( 199 ), 'contains 100' );
	assert.ok( !range.containsOffset( 200 ), 'doesn\'t contain 200' );
	assert.ok( !range.containsRange( new ve.Range( 99, 100 ) ), 'doesn\'t contain 99, 100' );
	assert.ok( range.containsRange( new ve.Range( 100, 199 ) ), 'contains 100, 199' );

	range = new ve.Range( 200, 100 );
	assert.equal( range.isCollapsed(), false );
	assert.equal( range.isBackwards(), true );
	assert.equal( range.getLength(), 100 );
	assert.ok( !range.containsOffset( 99 ), 'doesn\'t contain 50' );
	assert.ok( range.containsOffset( 100 ), 'contains 150' );
	assert.ok( range.containsOffset( 199 ), 'contains 100' );
	assert.ok( !range.containsOffset( 200 ), 'doesn\'t contain 250' );
	assert.ok( !range.containsRange( new ve.Range( 99, 100 ) ), 'doesn\'t contain 99, 100' );
	assert.ok( range.containsRange( new ve.Range( 100, 199 ) ), 'contains 100, 199' );

	assert.equalRange( range, range.clone(), 'clone produces an equal range' );

	range = new ve.Range( 100 );
	assert.equal( range.isCollapsed(), true );
	assert.equal( range.isBackwards(), false );
	assert.equal( range.getLength(), 0 );

} );

// TODO: newFromTranslatedRange
// TODO: newCoveringRange
// TODO: newFromJSON
// TODO: flip
// TODO: truncate
// TODO: toJSON
