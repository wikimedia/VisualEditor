/*!
 * VisualEditor MetaList tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.dm.MetaList' );

/* Tests */

function assertItemsMatchMetadata( assert, metadata, list, msg, full ) {
	var i, j, k = 0, items = list.getAllItems();
	for ( i in metadata ) {
		if ( ve.isArray( metadata[i] ) ) {
			for ( j = 0; j < metadata[i].length; j++ ) {
				assert.strictEqual( items[k].getOffset(), Number( i ), msg + ' (offset (' + i + ', ' + j + '))' );
				assert.strictEqual( items[k].getIndex(), j, msg + ' (index(' + i + ', ' + j + '))' );
				if ( full ) {
					assert.strictEqual( items[k].getElement(), metadata[i][j], msg + ' (element(' + i + ', ' + j + '))' );
					assert.strictEqual( items[k].getParentList(), list, msg + ' (parentList(' + i + ', ' + j + '))' );
				}
				k++;
			}
		}
	}
	assert.strictEqual( items.length, k, msg + ' (number of items)' );
}

QUnit.test( 'constructor', function ( assert ) {
	 var i, n = 0,
		doc = new ve.dm.Document( ve.copyArray( ve.dm.example.withMeta ) ),
		surface = new ve.dm.Surface( doc ),
		list = new ve.dm.MetaList( surface ),
		metadata = doc.metadata;
	for ( i in metadata ) {
		if ( ve.isArray( metadata[i] ) ) {
			n += metadata[i].length;
		}
	}
	QUnit.expect( 4*n + 1 );
	assertItemsMatchMetadata( assert, metadata, list, 'Constructor', true );
} );

QUnit.test( 'onTransact', function ( assert ) {
	var i, j, surface, tx, list, n = 0,
		doc = new ve.dm.Document( ve.copyArray( ve.dm.example.withMeta ) ),
		comment = { 'type': 'alienMeta', 'attributes': { 'style': 'comment', 'text': 'onTransact test' } },
		heading = { 'type': 'heading', 'attributes': { 'level': 2 } },
		cases = [
			{
				// delta: 0
				'calls': [
					[ 'pushRetain', 1 ],
					[ 'pushReplace', [], [ 'Q', 'u', 'u', 'x' ] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplace', [ 'B' ], [] ],
					[ 'pushRetain', 1 ],
					[ 'pushReplace', [ 'r', 'B', 'a', 'z' ], [ '!' ] ],
					[ 'pushRetain', 2 ]
				],
				'msg': 'Transaction inserting, replacing and removing text'
			},
			{
				// delta: 0
				'calls': [
					[ 'pushRetainMetadata', 1 ],
					[ 'pushReplaceMetadata', [], [ comment ] ],
					[ 'pushRetain', 4 ],
					[ 'pushReplaceMetadata', [ ve.dm.example.withMetaMetaData[4][0] ], [] ],
					[ 'pushRetain', 3 ],
					[ 'pushReplaceMetadata', [ ve.dm.example.withMetaMetaData[7][0] ], [ comment ] ],
					[ 'pushRetain', 4 ],
					[ 'pushRetainMetadata', 1 ],
					[ 'pushReplaceMetadata', [ ve.dm.example.withMetaMetaData[11][1] ], [] ],
					[ 'pushRetainMetadata', 1 ],
					[ 'pushReplaceMetadata', [], [ comment ] ]
				],
				'msg': 'Transaction inserting, replacing and removing metadata'
			},
			{
				// delta: 0
				'calls': [
					[ 'pushReplace', [ ve.dm.example.withMetaPlainData[0] ], [ heading ] ],
					[ 'pushRetain', 9 ],
					[ 'pushReplace', [ ve.dm.example.withMetaPlainData[10] ], [ { 'type': '/heading' } ] ]
				],
				'msg': 'Transaction converting paragraph to heading'
			},
			{
				// delta: -9
				'calls': [
					[ 'pushRetain', 1 ],
					[ 'pushReplace', ve.dm.example.withMetaPlainData.slice( 1, 10 ), [] ],
					[ 'pushRetain', 1 ]
				],
				'msg': 'Transaction blanking paragraph'
			},
			{
				// delta: +11
				'calls': [
					[ 'pushRetain', 11 ],
					[ 'pushReplace', [], ve.dm.example.withMetaPlainData ],
				],
				'msg': 'Transaction adding second paragraph at the end'
			},
			{
				// delta: -2
				'calls': [
					[ 'pushRetain', 1 ],
					[ 'pushReplace', ve.dm.example.withMetaPlainData.slice( 1, 8 ), [] ],
					[ 'pushRetain', 1 ],
					[ 'pushReplaceMetadata', [ ve.dm.example.withMetaMetaData[9][0] ], [] ],
					[ 'pushRetain', 2 ],
					[ 'pushRetainMetadata', 2 ],
					// The two operations below have to be in this order because of bug 46138
					[ 'pushReplace', [], [ { 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' } ] ],
					[ 'pushReplaceMetadata', [], [ comment ] ]
				],
				'msg': 'Transaction adding and removing text and metadata'
			}
	];
	for ( i in doc.metadata ) {
		if ( ve.isArray( doc.metadata[i] ) ) {
			n += doc.metadata[i].length;
		}
	}
	// HACK: This works because most transactions above don't change the document length, and the
	// ones that do change it cancel out
	QUnit.expect( cases.length*( 4*n + 2 ) );

	for ( i = 0; i < cases.length; i++ ) {
		tx = new ve.dm.Transaction();
		for ( j = 0; j < cases[i].calls.length; j++ ) {
			tx[cases[i].calls[j][0]].apply( tx, cases[i].calls[j].slice( 1 ) );
		}
		doc = new ve.dm.Document( ve.copyArray( ve.dm.example.withMeta ) );
		surface = new ve.dm.Surface( doc );
		list = new ve.dm.MetaList( surface );
		// Test both the transaction-via-surface and transaction-via-document flows
		surface.change( tx );
		assertItemsMatchMetadata( assert, doc.metadata, list, cases[i].msg, false );
		doc.rollback( tx );
		assertItemsMatchMetadata( assert, doc.metadata, list, cases[i].msg + ' (rollback)', false );
	}
} );

QUnit.test( 'findItem', function ( assert ) {
	var i, j, g, item, element, group, groupDesc,
		n = 0,
		groups = [ null ],
		doc = new ve.dm.Document( ve.copyArray( ve.dm.example.withMeta ) ),
		surface = new ve.dm.Surface( doc ),
		metadata = doc.metadata,
		list = new ve.dm.MetaList( surface );

	for ( i = 0; i < metadata.length; i++ ) {
		if ( ve.isArray( metadata[i] ) ) {
			n += metadata[i].length;
			for ( j = 0; j < metadata[i].length; j++ ) {
				group = ve.dm.metaItemFactory.getGroup( metadata[i][j].type );
				if ( ve.indexOf( group, groups ) === -1 ) {
					groups.push( group );
				}
			}
		}
		n++;
	}
	QUnit.expect( 2*n*groups.length );

	for ( g = 0; g < groups.length; g++ ) {
		groupDesc = groups[g] === null ? 'all items' : groups[g];
		for ( i = 0; i < metadata.length; i++ ) {
			j = 0;
			if ( ve.isArray( metadata[i] ) ) {
				for ( j = 0; j < metadata[i].length; j++ ) {
					item = list.findItem( i, j, groups[g] );
					element = item === null ? null : list.items[item].getElement();
					assert.strictEqual( element, metadata[i][j], groupDesc + ' (' + i + ', ' + j + ')' );
					assert.strictEqual( list.findItem( i, j, groups[g], true ), item, groupDesc + ' (forInsertion) (' + i + ', ' + j + ')' );
				}
			}
			assert.strictEqual( list.findItem( i, j, groups[g] ), null, groupDesc + ' (' + i + ', ' + j + ')' );
			assert.strictEqual( list.findItem( i, j, groups[g], true ), item + 1, groupDesc + ' (forInsertion) (' + i + ', ' + j + ')' );
		}
	}
} );

QUnit.test( 'insertMeta', 5, function ( assert ) {
	var expected,
		doc = new ve.dm.Document( ve.copyArray( ve.dm.example.withMeta ) ),
		surface = new ve.dm.Surface( doc ),
		list = new ve.dm.MetaList( surface ),
		insert = {
			'type': 'alienMeta',
			'attributes': {
				'style': 'comment',
				'text': 'insertMeta test'
			}
		};

	list.insertMeta( insert, 2, 0 );
	assert.deepEqual( doc.metadata[2], [ insert ], 'Inserting metadata at an offset without pre-existing metadata' );

	expected = doc.metadata[0].slice( 0 );
	expected.splice( 1, 0, insert );
	list.insertMeta( insert, 0, 1 );
	assert.deepEqual( doc.metadata[0], expected, 'Inserting metadata in the middle' );

	expected.push( insert );
	list.insertMeta( insert, 0 );
	assert.deepEqual( doc.metadata[0], expected, 'Inserting metadata without passing an index adds to the end' );

	list.insertMeta( insert, 1 );
	assert.deepEqual( doc.metadata[1], [ insert ], 'Inserting metadata without passing an index without pre-existing metadata' );

	list.insertMeta( new ve.dm.AlienMetaItem( insert ), 1 );
	assert.deepEqual( doc.metadata[1], [ insert, insert ], 'Passing a MetaItem rather than an element' );
} );

QUnit.test( 'removeMeta', 4, function ( assert ) {
	var expected,
		doc = new ve.dm.Document( ve.copyArray( ve.dm.example.withMeta ) ),
		surface = new ve.dm.Surface( doc ),
		list = new ve.dm.MetaList( surface );

	list.removeMeta( list.getItemAt( 4, 0 ) );
	assert.deepEqual( doc.metadata[4], [], 'Removing the only item at offset 4' );

	expected = doc.metadata[0].slice( 0 );
	expected.splice( 1, 1 );
	list.removeMeta( list.getItemAt( 0, 1 ) );
	assert.deepEqual( doc.metadata[0], expected, 'Removing the item at (0,1)' );

	expected = doc.metadata[11].slice( 0 );
	expected.splice( 0, 1 );
	list.getItemAt( 11, 0 ).remove();
	assert.deepEqual( doc.metadata[11], expected, 'Removing (11,0) using .remove()' );

	expected.splice( 1, 1 );
	list.getItemAt( 11, 1 ).remove();
	assert.deepEqual( doc.metadata[11], expected, 'Removing (11,1) (formerly (11,2)) using .remove()' );
} );