module( 'es/bases' );

function DocumentNodeStub( items, name, size ) {
	this.name = name;
	this.size = size;
	return es.extendObject( new es.DocumentNode( items ), this );
}

DocumentNodeStub.prototype.getContentLength = function() {
	return this.size;
};

DocumentNodeStub.prototype.getElementLength = function() {
	// Mimic document data which has an opening and closing around the content
	return this.size + 2;
};

test( 'es.DocumentNode', function() {

	// Stub test

	strictEqual(
		( new DocumentNodeStub( [], 'a', 0 ) ).getElementLength(),
		2,
		'DocumentNodeStub.getElementLength() returns initialized length plus 2 for elements'
	);

	// Stubs

	var a = new DocumentNodeStub( [], 'a', 0 ),
		b = new DocumentNodeStub( [], 'b', 1 ),
		c = new DocumentNodeStub( [], 'c', 2 ),
		d = new DocumentNodeStub( [], 'd', 3 ),
		e = new DocumentNodeStub( [], 'e', 4 ),
		root1 = new DocumentNodeStub( [a, b, c, d, e], 'root1', 20 ),
		i;

	// getRangeFromNode tests

	var getRangeFromNodeTests = [
		{ 'input': a, 'output': new es.Range( 0, 2 ) },
		{ 'input': b, 'output': new es.Range( 2, 5 ) },
		{ 'input': c, 'output': new es.Range( 5, 9 ) },
		{ 'input': d, 'output': new es.Range( 9, 14 ) },
		{ 'input': e, 'output': new es.Range( 14, 20 ) },
		{ 'input': null, 'output': null }
	];
	
	for ( i = 0; i < getRangeFromNodeTests.length; i++ ) {
		deepEqual(
			root1.getRangeFromNode( getRangeFromNodeTests[i].input ),
			getRangeFromNodeTests[i].output,
			'getRangeFromNode returns the correct range or null if item is not found'
		);
	}

	// getNodeFromOffset tests

	var getNodeFromOffsetTests = [
		{ 'input': -1, 'output': null },
		{ 'input': 0, 'output': a },
		{ 'input': 1, 'output': a },
		{ 'input': 2, 'output': b },
		{ 'input': 3, 'output': b },
		{ 'input': 4, 'output': b },
		{ 'input': 5, 'output': c },
		{ 'input': 6, 'output': c },
		{ 'input': 7, 'output': c },
		{ 'input': 8, 'output': c },
		{ 'input': 9, 'output': d },
		{ 'input': 10, 'output': d },
		{ 'input': 11, 'output': d },
		{ 'input': 12, 'output': d },
		{ 'input': 13, 'output': d },
		{ 'input': 14, 'output': e },
		{ 'input': 15, 'output': e },
		{ 'input': 16, 'output': e },
		{ 'input': 17, 'output': e },
		{ 'input': 18, 'output': e },
		{ 'input': 19, 'output': e },
		{ 'input': 20, 'output': null }
	];

	for ( i = 0; i < getNodeFromOffsetTests.length; i++ ) {
		strictEqual(
			root1.getNodeFromOffset( getNodeFromOffsetTests[i].input ),
			getNodeFromOffsetTests[i].output,
			'getNodeFromOffset finds the right item or returns null when out of range'
		);
	}

	// getOffsetFromNode tests

	var getOffsetFromNodeTests = [
		{ 'input': a, 'output': 0 },
		{ 'input': b, 'output': 2 },
		{ 'input': c, 'output': 5 },
		{ 'input': d, 'output': 9 },
		{ 'input': e, 'output': 14 },
		{ 'input': null, 'output': -1 }
	];

	for ( i = 0; i < getOffsetFromNodeTests.length; i++ ) {
		strictEqual(
			root1.getOffsetFromNode( getOffsetFromNodeTests[i].input ),
			getOffsetFromNodeTests[i].output,
			'getOffsetFromNode finds the right offset or returns -1 when node is not found'
		);
	}
} );

test( 'es.DocumentNode.selectNodes', function() {

	// selectNodes tests

	// <f> a b c d e f g h </f> <g> a b c d e f g h </g> <h> a b c d e f g h </h>
	//^   ^ ^ ^ ^ ^ ^ ^ ^ ^    ^   ^ ^ ^ ^ ^ ^ ^ ^ ^    ^   ^ ^ ^ ^ ^ ^ ^ ^ ^     ^
	//0   1 2 3 4 5 6 7 8 9    0   1 2 3 4 5 6 7 8 9    0   1 2 3 4 5 6 7 8 9     0
	//    0 1 2 3 4 5 6 7 8        0 1 2 3 4 5 6 7 8        0 1 2 3 4 5 6 7 8
	var f = new DocumentNodeStub( [], 'f', 8 ),
		g = new DocumentNodeStub( [], 'g', 8 ),
		h = new DocumentNodeStub( [], 'h', 8 ),
		root2 = new DocumentNodeStub( [f, g, h], 'root2', 30 );
	// FIXME: QUnit thinks f == g because both are empty arrays. Rawr.
	// TODO make sure there is a test case for everything that is special-cased in the code
	// TODO also nest with a more complicated nested structure, like the one from es.DocumentModel.test.js
	
	// Possible positions are:
	// * before beginning
	// * at beginning
	// * middle
	// * at end
	// * past end
	var selectNodesTests = [
		// Complete set of combinations within the same node:
		{
			'node': root2,
			'input': new es.Range( 0, 0 ),
			'output': [],
			'desc': 'Zero-length range before the beginning of a node'
		},
		{
			'node': root2,
			'input': new es.Range( 0, 1 ),
			'output': [{ 'node': f, 'range': new es.Range( 0, 0 ) }],
			'desc': 'Range starting before the beginning of a node and ending at the beginning'
		},
		{
			'node': root2,
			'input': new es.Range( 10, 15 ),
			'output': [{ 'node': g, 'range': new es.Range( 0, 4 ) }],
			'desc': 'Range starting before the beginning of a node and ending in the middle'
		},
		{
			'node': root2,
			'input': new es.Range( 20, 29 ),
			'output': [{ 'node': h, 'range': new es.Range( 0, 8 ) }],
			'desc': 'Range starting before the beginning of a node and ending at the end'
		},
		{
			'node': root2,
			'input': new es.Range( 0, 10 ),
			'output': [{ 'node': f } ],
			'desc': 'Range starting before the beginning of a node and ending past the end'
		},
		{
			'node': root2,
			'input': new es.Range( 11, 11 ),
			'output': [{ 'node': g, 'range': new es.Range( 0, 0 ) }],
			'desc': 'Zero-length range at the beginning of a node'
		},
		{
			'node': root2,
			'input': new es.Range( 21, 26 ),
			'output': [{ 'node': h, 'range': new es.Range( 0, 5 ) }],
			'desc': 'Range starting at the beginning of a node and ending in the middle'
		},
		{
			'node': root2,
			'input': new es.Range( 1, 9 ),
			'output': [{ 'node': f, 'range': new es.Range( 0, 8 ) }],
			'desc': 'Range starting at the beginning of a node and ending at the end'
		},
		{
			'node': root2,
			'input': new es.Range( 11, 20 ),
			'output': [{ 'node': g, 'range': new es.Range( 0, 8 ) }],
			'desc': 'Range starting at the beginning of a node and ending past the end'
		},
		{
			'node': root2,
			'input': new es.Range( 22, 22 ),
			'output': [{ 'node': h, 'range': new es.Range( 1, 1 ) }],
			'desc': 'Zero-length range in the middle of a node'
		},
		{
			'node': root2,
			'input': new es.Range( 2, 7 ),
			'output': [{ 'node': f, 'range': new es.Range( 1, 6 ) }],
			'desc': 'Range starting and ending in the middle of the same node'
		},
		{
			'node': root2,
			'input': new es.Range( 13, 19 ),
			'output': [{ 'node': g, 'range': new es.Range( 2, 8 ) }],
			'desc': 'Range starting in the middle of a node and ending at the end'
		},
		{
			'node': root2,
			'input': new es.Range( 24, 30 ),
			'output': [{ 'node': h, 'range': new es.Range( 3, 8 ) }],
			'desc': 'Range starting in the middle of a node and ending past the end'
		},
		{
			'node': root2,
			'input': new es.Range( 9, 9 ),
			'output': [{ 'node': f, 'range': new es.Range( 8, 8 ) }],
			'desc': 'Zero-length range at the end of a node'
		},
		{
			'node': root2,
			'input': new es.Range( 19, 20 ),
			'output': [{ 'node': g, 'range': new es.Range( 8, 8 ) }],
			'desc': 'Range starting at the end of a node and ending past the end'
		},
		{
			'node': root2,
			'input': new es.Range( 30, 30 ),
			'output': [],
			'desc': 'Zero-length range past the end of a node'
		},
		// TODO add a complete set of combinations for cross-node ranges
		{
			'node': root2,
			'input': new es.Range( 5, 25 ),
			'output': [
				{ 'node': f, 'range': new es.Range( 4, 8 ) },
				{ 'node': g },
				{ 'node': h, 'range': new es.Range( 0, 4 ) }
			],
			'desc': 'Range starting in the middle of the first node and ending in the middle of the third'
		},
		{
			'node': root2,
			'input': new es.Range( 5, 11 ),
			'output': [
				{ 'node': f, 'range': new es.Range( 4, 8 ) },
				{ 'node': g, 'range': new es.Range( 0, 0 ) }
			],
			'desc': 'Range starting in the middle of a node and ending at the beginning of the second'
		},
		{
			'node': root2,
			'input': new es.Range( 5, 12 ),
			'output': [
				{ 'node': f, 'range': new es.Range( 4, 8 ) },
				{ 'node': g, 'range': new es.Range( 0, 1 ) }
			],
			'desc': 'Range starting in the middle of a node and ending after the first character of the second'
		},
		{
			'node': root2,
			'input': new es.Range( 8, 16 ),
			'output': [
				{ 'node': f, 'range': new es.Range( 7, 8 ) },
				{ 'node': g, 'range': new es.Range( 0, 5 ) }
			],
			'desc': 'Range starting before the last character of a node and ending in the middle of the next node'
		},
		{
			'node': root2,
			'input': new es.Range( 9, 16 ),
			'output': [
				{ 'node': f, 'range': new es.Range( 8, 8 ) },
				{ 'node': g, 'range': new es.Range( 0, 5 ) }
			],
			'desc': 'Range starting at the end of a node and ending in the middle of the next node'
		}
	];

	for ( var i = 0; i < selectNodesTests.length; i++ ) {
		deepEqual(
			root2.selectNodes( selectNodesTests[i].input ),
			selectNodesTests[i].output,
			selectNodesTests[i].desc
		);
	}
} );
