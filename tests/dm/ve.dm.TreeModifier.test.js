/*!
 * VisualEditor DataModel TreeModifier tests.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

ve.dm.TreeModifier.prototype.dump = function () {
	var lines = [],
		del = this.deletions,
		ins = this.insertions;
	function nodeTag( idx, node ) {
		return ( idx === undefined ? '' : idx + ' ' ) + (
			del.indexOf( node ) !== -1 ? 'DEL ' :
				ins.indexOf( node ) !== -1 ? 'INS ' :
					''
		);
	}
	function appendNodeLines( indent, node, idx ) {
		var sp = '-\t'.repeat( indent );
		if ( node.type === 'text' ) {
			lines.push( sp + nodeTag( idx, node ) + 'VeDmTextNode(' + node.getOuterLength() + ')' );
			return;
		}
		lines.push( sp + nodeTag( idx, node ) + node.constructor.name + '(' +
			node.getOuterLength() + ')' );
		if ( node.hasChildren() ) {
			node.children.forEach( function ( child, i ) {
				appendNodeLines( indent + 1, child, i );
			} );
		}
	}
	appendNodeLines( 0, this.document.documentNode );
	lines.push( 'inserter: { path: [ ' + this.inserter.path.join( ', ' ) +
			' ], offset: ' + this.inserter.offset + ' }, ' +
			this.inserter.linearOffset );
	lines.push( 'remover:  { path: [ ' + this.remover.path.join( ', ' ) +
			' ], offset: ' + this.remover.offset + ' }, ' +
			this.remover.linearOffset );
	ve.batchSplice( lines, lines.length, 0, this.data.data.map( function ( item, i ) {
		return i + ':' + JSON.stringify( item ) + ',';
	} ) );
	return lines.join( '\n' );
};

QUnit.module( 've.dm.TreeModifier' );

QUnit.test( 'modify', function ( assert ) {
	var origData, surface, doc, tx, expectedTreeDump, actualTreeDump;

	assert.expect( 2 );

	function dumpTree( doc ) {
		// Build a tree modifier just for the .dump method (don't modify anything)
		return new ve.dm.TreeModifier( doc, new ve.dm.Transaction() ).dump();
	}

	origData = [
		{ type: 'paragraph' },
		'a',
		'b',
		'c',
		'd',
		{ type: '/paragraph' },
		{ type: 'paragraph' },
		'e',
		'f',
		'g',
		{ type: '/paragraph' },
		{ type: 'internalList' },
		{ type: '/internalList' }
	];
	surface = new ve.dm.Surface(
		ve.dm.example.createExampleDocumentFromData( origData )
	);
	doc = surface.documentModel;

	tx = new ve.dm.Transaction( [
		{ type: 'retain', length: 2 },
		{
			type: 'replace',
			remove: [ 'b' ],
			insert: [ 'X', 'Y' ],
			insertedDataOffset: 0,
			insertedDataLength: 2
		},
		{ type: 'retain', length: 2 },
		{
			type: 'replace',
			remove: [ { type: '/paragraph' }, { type: 'paragraph' }, 'e' ],
			insert: [ 'Z' ],
			insertedDataOffset: 0,
			insertedDataLength: 0
		},
		{ type: 'retain', length: 5 }
	] );

	doc.commit( tx );
	actualTreeDump = dumpTree( doc );
	doc.rebuildTree();
	expectedTreeDump = dumpTree( doc );
	assert.strictEqual(
		actualTreeDump,
		expectedTreeDump,
		'Modified tree matches rebuilt tree, forward'
	);

	doc.commit( tx.reversed() );
	actualTreeDump = dumpTree( doc );
	doc.rebuildTree();
	expectedTreeDump = dumpTree( doc );
	assert.strictEqual(
		actualTreeDump,
		expectedTreeDump,
		'Modified tree matches rebuilt tree, reversed'
	);
} );

QUnit.test( 'setupBlockSlugs', function ( assert ) {
	var doc = new ve.dm.Surface(
		ve.dm.example.createExampleDocumentFromData( [] )
	).documentModel;

	assert.expect( 1 );

	doc.commit( new ve.dm.Transaction( [ {
		type: 'replace',
		remove: [],
		insert: [ { type: 'paragraph' }, { type: '/paragraph' } ],
		insertedDataOffset: 0,
		insertedDataLength: 2
	} ] ) );

	assert.deepEqual(
		doc.getDocumentNode().getChildren()[ 0 ].slugPositions,
		{ 0: true },
		'Modified paragraph node contains a slug'
	);
} );
