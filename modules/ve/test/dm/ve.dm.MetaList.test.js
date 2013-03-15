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
		list = new ve.dm.MetaList( doc ),
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
	var i, j, tx, list, n = 0,
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
		list = new ve.dm.MetaList( doc );
		ve.dm.TransactionProcessor.commit( doc, tx );
		assertItemsMatchMetadata( assert, doc.metadata, list, cases[i].msg, false );
		ve.dm.TransactionProcessor.rollback( doc, tx );
		assertItemsMatchMetadata( assert, doc.metadata, list, cases[i].msg + ' (rollback)', false );
	}
} );

QUnit.test( 'findItem', function ( assert ) {
	var i, j, g, item, element, group, groupDesc,
		n = 0,
		groups = [ null ],
		doc = new ve.dm.Document( ve.copyArray( ve.dm.example.withMeta ) ),
		metadata = doc.metadata,
		list = new ve.dm.MetaList( doc );

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