/*!
 * VisualEditor Range tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.Range' );

/* Tests */

QUnit.test( 'Basic usage (isCollapsed, isBackwards, getLength, equals, equalsSelection, containsOffset, containsRange, touchesRange)', ( assert ) => {
	let range = new ve.Range( 100, 200 );

	assert.false( range.isCollapsed(), 'forwards range is not collapsed' );
	assert.false( range.isBackwards(), 'forwards range is not backwards' );
	assert.strictEqual( range.getLength(), 100, 'forwards range has length 100' );
	assert.true( range.equals( new ve.Range( 100, 200 ) ), 'equals matches identical range' );
	assert.false( range.equals( new ve.Range( 200, 100 ) ), 'equals doesn\'t match reverse range' );
	assert.true( range.equalsSelection( new ve.Range( 200, 100 ) ), 'equalsSelection matches reverse range' );
	assert.false( range.containsOffset( 99 ), 'doesn\'t contain 99' );
	assert.true( range.containsOffset( 100 ), 'contains 100' );
	assert.true( range.containsOffset( 199 ), 'contains 199' );
	assert.false( range.containsOffset( 200 ), 'doesn\'t contain 200' );
	assert.false( range.containsRange( new ve.Range( 99, 100 ) ), 'doesn\'t contain 99, 100' );
	assert.true( range.containsRange( new ve.Range( 100, 199 ) ), 'contains 101, 199' );
	assert.true( range.containsRange( range ), 'contains itself' );
	assert.false( range.containsRange( new ve.Range( 100, 201 ) ), 'doesn\'t contain 100, 201' );

	range = new ve.Range( 200, 100 );
	assert.false( range.isCollapsed(), 'backwards range is not collapsed' );
	assert.true( range.isBackwards(), 'backwards range is backwards' );
	assert.strictEqual( range.getLength(), 100, 'backwards range has length 100' );
	assert.false( range.containsOffset( 99 ), 'doesn\'t contain 99' );
	assert.true( range.containsOffset( 100 ), 'contains 100' );
	assert.true( range.containsOffset( 199 ), 'contains 199' );
	assert.false( range.containsOffset( 200 ), 'doesn\'t contain 200' );

	assert.false( range.containsRange( new ve.Range( 99, 100 ) ), 'doesn\'t contain 99, 100' );
	assert.true( range.containsRange( new ve.Range( 100, 199 ) ), 'contains 101, 199' );
	assert.true( range.containsRange( range ), 'contains itself' );
	assert.false( range.containsRange( new ve.Range( 100, 201 ) ), 'doesn\'t contain 100, 201' );

	assert.false( range.touchesRange( new ve.Range( 98, 99 ) ), 'doesn\'t touch 98, 99' );
	assert.false( range.touchesRange( new ve.Range( 203, 201 ) ), 'doesn\'t touch 203, 201' );
	assert.true( range.touchesRange( new ve.Range( 98, 100 ) ), 'touches 98, 100' );
	assert.true( range.touchesRange( new ve.Range( 200, 201 ) ), 'touches 200, 201' );
	assert.true( range.touchesRange( new ve.Range( 150, 98 ) ), 'touches 150, 98' );
	assert.true( range.touchesRange( new ve.Range( 0, 300 ) ), 'touches 0, 300' );
	assert.true( range.touchesRange( range ), 'returns true when passed itself' );

	assert.false( range.overlapsRange( new ve.Range( 99, 100 ) ), 'doesn\'t overlap 99, 100' );
	assert.false( range.overlapsRange( new ve.Range( 202, 200 ) ), 'doesn\'t overlap 202, 200' );
	assert.true( range.overlapsRange( new ve.Range( 99, 101 ) ), 'overlaps 99, 101' );
	assert.true( range.overlapsRange( new ve.Range( 199, 201 ) ), 'overlaps 199, 201' );
	assert.true( range.overlapsRange( new ve.Range( 150, 98 ) ), 'overlaps 150, 98' );
	assert.true( range.overlapsRange( new ve.Range( 0, 300 ) ), 'overlaps 0, 300' );
	assert.true( range.overlapsRange( range ), 'returns true when passed itself' );

	range = new ve.Range( 100 );
	assert.true( range.isCollapsed(), 'collapsed range is collapsed' );
	assert.false( range.isBackwards(), 'collapsed range is not backwards' );
	assert.strictEqual( range.getLength(), 0, 'collapsed range has zero length' );

} );

QUnit.test( 'Modification (flip, truncate, expand, translate)', ( assert ) => {
	const range = new ve.Range( 100, 200 );

	assert.equalRange( range.flip(), new ve.Range( 200, 100 ), 'flip reverses the range' );
	assert.equalRange( range.flip().flip(), range, 'double flip does nothing' );

	assert.equalRange( range.truncate( 50 ), new ve.Range( 100, 150 ), 'truncate 50' );
	assert.equalRange( range.truncate( 150 ), range, 'truncate 150 does nothing' );
	assert.equalRange( range.truncate( -50 ), new ve.Range( 150, 200 ), 'truncate -50' );
	assert.equalRange( range.truncate( -150 ), range, 'truncate -150 does nothing' );

	assert.equalRange( range.expand( new ve.Range( 150, 250 ) ), new ve.Range( 100, 250 ), 'overlapping expand to right' );
	assert.equalRange( range.expand( new ve.Range( 250 ) ), new ve.Range( 100, 250 ), 'non-overlapping expand to right' );
	assert.equalRange( range.expand( new ve.Range( 250, 150 ) ), new ve.Range( 100, 250 ), 'backwards overlapping expand to right' );
	assert.equalRange( range.expand( new ve.Range( 50, 150 ) ), new ve.Range( 50, 200 ), 'overlapping expand to left' );
	assert.equalRange( range.expand( new ve.Range( 50 ) ), new ve.Range( 50, 200 ), 'non-overlapping expand to left' );
	assert.equalRange( range.expand( new ve.Range( 150, 50 ) ), new ve.Range( 50, 200 ), 'backwards overlapping expand to left' );

	assert.equalRange( range.translate( 10 ), new ve.Range( 110, 210 ), 'translate 10' );
	assert.equalRange( range.translate( -10 ), new ve.Range( 90, 190 ), 'translate -10' );

	assert.true( range.flip().expand( new ve.Range( 250 ) ).isBackwards(), 'expands preserves backwards' );

} );

QUnit.test( 'Factory methods & serialization (newCoveringRange, newFromJSON, toJSON)', ( assert ) => {
	const range = new ve.Range( 100, 200 );

	assert.equalRange(
		ve.Range.static.newCoveringRange( [ range, new ve.Range( 150, 250 ) ] ),
		new ve.Range( 100, 250 ),
		'covering range'
	);
	assert.equalRange(
		ve.Range.static.newCoveringRange( [ range, new ve.Range( 150, 250 ) ], true ),
		new ve.Range( 250, 100 ),
		'backwards covering range'
	);

	assert.throws(
		() => {
			ve.Range.static.newCoveringRange( [], true );
		},
		Error,
		'throws an exception when providing an empty array of ranges'
	);

	assert.deepEqual( range.toJSON(), { type: 'range', from: 100, to: 200 }, 'toJSON' );
	assert.deepEqual( range.flip().toJSON(), { type: 'range', from: 200, to: 100 }, 'backwards toJSON' );

	assert.equalRange( ve.Range.static.newFromJSON( JSON.stringify( range.toJSON() ) ), range, 'newFromJSON' );
	assert.equalRange( ve.Range.static.newFromJSON( JSON.stringify( range.flip().toJSON() ) ), range.flip(), 'backwards newFromJSON' );

} );

// TODO: newFromHash
