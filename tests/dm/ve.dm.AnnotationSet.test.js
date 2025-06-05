/*!
 * VisualEditor DataModel AnnotationSet tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.dm.AnnotationSet' );

/* Tests */

QUnit.test( 'Basic usage', ( assert ) => {
	const store = new ve.dm.HashValueStore(),
		bold = new ve.dm.BoldAnnotation(),
		italic = new ve.dm.ItalicAnnotation(),
		underline = new ve.dm.UnderlineAnnotation(),
		annotationSet = new ve.dm.AnnotationSet( store, store.hashAll( [ bold, italic ] ) ),
		emptySet = new ve.dm.AnnotationSet( store );
	let annotationSet2 = new ve.dm.AnnotationSet( store, store.hashAll( [ italic, underline ] ) );

	assert.strictEqual( annotationSet.getLength(), 2, 'getLength is 2' );
	assert.false( annotationSet.isEmpty(), 'isEmpty is false' );
	assert.deepEqual( annotationSet.get( 0 ), bold, 'get(0) is bold' );
	assert.true( annotationSet.contains( italic ), 'contains italic' );
	assert.false( annotationSet.contains( underline ), 'doesn\'t contain underline' );
	assert.true( annotationSet.containsHash( store.hashOfValue( italic ) ), 'contains italic by hash' );
	assert.false( annotationSet.containsHash( store.hashOfValue( underline ) ), 'doesn\'t contain underline by hash' );
	assert.true( annotationSet.containsAnyOf( annotationSet2 ), 'containsAnyOf set2 is true' );
	assert.false( annotationSet.containsAnyOf( emptySet ), 'containsAnyOf empty set is false' );
	assert.false( annotationSet.containsAllOf( annotationSet2 ), 'containsAllOf set2 set is false' );
	assert.true( annotationSet.containsAllOf( annotationSet ), 'containsAllOf self is true' );
	assert.strictEqual( annotationSet.offsetOf( italic ), 1, 'offsetOf italic is 1' );
	assert.strictEqual( annotationSet.offsetOf( underline ), -1, 'offsetOf underline is -1' );
	assert.deepEqual(
		annotationSet.filter( ( annotation ) => annotation.name === 'textStyle/bold' ).get(),
		[ bold ], 'filter for name=textStyle/bold returns just bold annotation'
	);
	assert.true( annotationSet.hasAnnotationWithName( 'textStyle/bold' ), 'hasAnnotationWithName textStyle/bold is true' );
	assert.false( annotationSet.hasAnnotationWithName( 'textStyle/underline' ), 'hasAnnotationWithName underline is false' );

	annotationSet2.add( bold, 1 );
	assert.strictEqual( annotationSet2.offsetOf( bold ), 1, 'set2 contains bold at 1 after add at 1' );
	annotationSet2.remove( bold );
	assert.false( annotationSet2.contains( bold ), 'set2 doesn\'t contain bold after remove' );
	annotationSet2.add( bold, 0 );
	assert.strictEqual( annotationSet2.offsetOf( bold ), 0, 'set2 contains bold at 0 after add at 0' );
	annotationSet2.add( bold, 0 );
	assert.strictEqual( annotationSet2.getLength(), 3, 'adding existing annotation doesn\'t change length' );
	// Set is now [ bold, italic, underline ]
	annotationSet2.removeAt( 2 );
	assert.false( annotationSet2.contains( underline ), 'set2 doesn\'t contain underline after removeAt 2' );
	annotationSet2.removeAll();
	assert.true( annotationSet2.isEmpty(), 'set2 is empty after removeAll' );
	annotationSet2.addSet( annotationSet );
	assert.strictEqual( annotationSet.getLength(), 2, 'set2 has length 2 after addSet' );
	annotationSet2.removeSet( annotationSet );
	assert.true( annotationSet2.isEmpty(), 'set2 is empty after removeSet' );
	annotationSet2.push( bold );
	annotationSet2.push( italic );
	assert.deepEqual( annotationSet2.get(), [ bold, italic ], 'set2 contains bold then italic after two pushes' );

	annotationSet2 = new ve.dm.AnnotationSet( store, store.hashAll( [ italic, underline ] ) );
	annotationSet2.removeNotInSet( annotationSet );
	assert.true( annotationSet.contains( italic ) && !annotationSet.contains( underline ), 'contains italic not underline after removeNotInSet' );
	annotationSet2.add( underline, 1 );
	let annotationSet3 = annotationSet2.reversed();
	assert.strictEqual( annotationSet3.offsetOf( underline ), 0, 'underline has offsetOf 0 after reverse' );
	annotationSet3 = annotationSet.mergeWith( annotationSet2 );
	assert.strictEqual( annotationSet3.getLength(), 3, 'set merged with set2 has length 3' );
	annotationSet3 = annotationSet.diffWith( annotationSet2 );
	assert.strictEqual( annotationSet3.getLength(), 1, 'set diffed with set2 has length 1' );
	assert.true( annotationSet3.contains( bold ), 'set diffed with set2 contains bold' );
	annotationSet3 = annotationSet.intersectWith( annotationSet2 );
	assert.strictEqual( annotationSet3.getLength(), 1, 'set intersected with set2 has length 1' );
	assert.true( annotationSet3.contains( italic ), 'set intersected with set2 contains italic' );
} );

QUnit.test( 'Comparable', ( assert ) => {
	const store = new ve.dm.HashValueStore(),
		bold = new ve.dm.BoldAnnotation(),
		italic = new ve.dm.ItalicAnnotation(),
		strong = new ve.dm.BoldAnnotation( { type: 'textStyle/bold', attributes: { nodeName: 'strong' } } ),
		underline = new ve.dm.UnderlineAnnotation(),
		annotationSet = new ve.dm.AnnotationSet( store, store.hashAll( [ bold, italic ] ) ),
		annotationSet2 = new ve.dm.AnnotationSet( store, store.hashAll( [ strong, underline ] ) ),
		emptySet = new ve.dm.AnnotationSet( store );

	assert.true( annotationSet.containsComparable( strong ), '[b,i] contains comparable strong' );
	assert.true( annotationSet.containsComparable( bold ), '[b,i] contains comparable b' );
	assert.false( annotationSet.containsComparable( underline ), '[b,i] doesn\'t contain comparable u' );

	let annotationSet3 = new ve.dm.AnnotationSet( store, store.hashAll( [ bold ] ) );
	assert.deepEqual( annotationSet.getComparableAnnotations( strong ), annotationSet3, '[b,i] get comparable strong returns [b]' );
	assert.deepEqual( annotationSet.getComparableAnnotations( underline ), emptySet, '[b,i] get comparable underline returns []' );

	annotationSet3 = new ve.dm.AnnotationSet( store, store.hashAll( [ bold ] ) );
	assert.deepEqual( annotationSet.getComparableAnnotationsFromSet( annotationSet2 ), annotationSet3, '[b,i] get comparable from set [strong,u] returns just [b]' );

	annotationSet3 = new ve.dm.AnnotationSet( store, store.hashAll( [ italic, strong ] ) );
	assert.true( annotationSet.compareTo( annotationSet3 ), '[b,i] compares to [i,strong]' );

} );
