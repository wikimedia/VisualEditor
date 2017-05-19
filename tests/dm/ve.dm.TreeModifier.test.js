/*!
 * VisualEditor DataModel TreeModifier tests.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

ve.dm.TreeModifier.prototype.dump = function () {
	var lines = [],
		del = this.deletions,
		ins = this.insertions;
	function nodeTag( node ) {
		// eslint-disable-next-line no-bitwise
		return ~del.indexOf( node ) ? 'DEL ' : ~ins.indexOf( node ) ? 'INS ' : '';
	}
	function appendNodeLines( indent, node ) {
		var sp = '-\t'.repeat( indent );
		if ( node instanceof ve.dm.TextNode ) {
			lines.push( sp + nodeTag( node ) + 'VeDmTextNode(' + node.getLength() + ')' );
			return;
		}
		lines.push( sp + nodeTag( node ) + node.constructor.name + '(' +
			node.getOuterLength() + ')' );
		if ( node.hasChildren() ) {
			node.children.forEach( appendNodeLines.bind( null, indent + 1 ) );
		}
	}
	appendNodeLines( 0, this.document.documentNode );
	lines.push( 'inserter: { path: [ ' + this.inserter.path.join( ', ' ) +
			' ], offset: ' + this.inserter.offset + ' }' );
	lines.push( 'remover:  { path: [ ' + this.remover.path.join( ', ' ) +
			' ], offset: ' + this.remover.offset + ' }' );
	return lines.join( '\n' );
};

QUnit.module( 've.dm.TreeModifier' );

QUnit.test( 'modify', 2, function ( assert ) {
	var origData, surface, doc, tx, expectedTreeDump, actualTreeDump;

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
