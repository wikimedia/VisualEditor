/*!
 * VisualEditor Range tests.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.Range' );

/* Tests */

QUnit.test( 'Basic usage (clone, isCollapsed, isBackwards, getLength, equals, equalsSelection, containsOffset, containsRange)', 27, function ( assert ) {
	var range;

	range = new ve.Range( 100, 200 );
	assert.strictEqual( range.isCollapsed(), false );
	assert.strictEqual( range.isBackwards(), false );
	assert.strictEqual( range.getLength(), 100 );
	assert.strictEqual( range.equals( new ve.Range( 100, 200 ) ), true, 'equals matches identical range' );
	assert.strictEqual( range.equals( new ve.Range( 200, 100 ) ), false, 'equals doesn\'t match reverse range' );
	assert.strictEqual( range.equalsSelection( new ve.Range( 200, 100 ) ), true, 'equalsSelection matches reverse range' );
	assert.strictEqual( range.containsOffset( 99 ), false, 'doesn\'t contain 99' );
	assert.strictEqual( range.containsOffset( 100 ), true, 'contains 100' );
	assert.strictEqual( range.containsOffset( 199 ), true, 'contains 199' );
	assert.strictEqual( range.containsOffset( 200 ), false, 'doesn\'t contain 200' );
	assert.strictEqual( range.containsRange( new ve.Range( 99, 100 ) ), false, 'doesn\'t contain 99, 100' );
	assert.strictEqual( range.containsRange( new ve.Range( 100, 199 ) ), true, 'contains 100, 199' );
	assert.strictEqual( range.containsRange( new ve.Range( 100, 200 ) ), false, 'doesn\'t contain 100, 200' );

	range = new ve.Range( 200, 100 );
	assert.strictEqual( range.isCollapsed(), false );
	assert.strictEqual( range.isBackwards(), true );
	assert.strictEqual( range.getLength(), 100 );
	assert.strictEqual( range.containsOffset( 99 ), false, 'doesn\'t contain 99' );
	assert.strictEqual( range.containsOffset( 100 ), true, 'contains 100' );
	assert.strictEqual( range.containsOffset( 199 ), true, 'contains 199' );
	assert.strictEqual( range.containsOffset( 200 ), false, 'doesn\'t contain 200' );
	assert.strictEqual( range.containsRange( new ve.Range( 99, 100 ) ), false, 'doesn\'t contain 99, 100' );
	assert.strictEqual( range.containsRange( new ve.Range( 100, 199 ) ), true, 'contains 100, 199' );
	assert.strictEqual( range.containsRange( new ve.Range( 100, 200 ) ), false, 'doesn\'t contain 100, 200' );

	assert.equalRange( range, range.clone(), 'clone produces an equal range' );

	range = new ve.Range( 100 );
	assert.strictEqual( range.isCollapsed(), true );
	assert.strictEqual( range.isBackwards(), false );
	assert.strictEqual( range.getLength(), 0 );

} );

// TODO: newFromTranslatedRange
// TODO: newCoveringRange
// TODO: newFromJSON
// TODO: flip
// TODO: truncate
// TODO: toJSON
