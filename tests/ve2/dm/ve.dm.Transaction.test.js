module( 've.dm.Transaction' );

test( 've.dm.Transaction', function() {
	var tx = new ve.dm.Transaction(),
		ops = [],
		diff = 0;

	deepEqual( tx.getOperations(), ops, 'new transactions have no operations' );
	deepEqual( tx.getLengthDifference(), diff, 'new transactions have zero length difference' );
	
	// Retain
	tx.pushRetain( 5 );
	ops.push( { 'type': 'retain', 'length': 5 } );
	deepEqual( tx.getOperations(), ops, 'pushRetain adds a retain operation' );
	deepEqual( tx.getLengthDifference(), diff, 'pushRetain does not change length difference' );
	
	// Multiple retain
	tx.pushRetain( 3 );
	ops[ops.length - 1].length += 3;
	deepEqual(
		tx.getOperations(),
		ops,
		'successive pushRetain calls grow last retain operation instead of adding a new one'
	);
	deepEqual(
		tx.getLengthDifference(),
		diff,
		'successive retain operations do not change length difference'
	);
	
	// Insert
	var abcParagraph = [ { 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' } ];
	tx.pushInsert( abcParagraph );
	ops.push( { 'type': 'insert', 'data': abcParagraph } );
	diff += abcParagraph.length;
	deepEqual( tx.getOperations(), ops, 'pushInsert adds an insert operation' );
	deepEqual(
		tx.getLengthDifference(),
		diff,
		'pushInsert increases the length difference correctly'
	);
	
	// Multiple insert
	var deParagraph = [ { 'type': 'paragraph' }, 'd', 'e', { 'type': '/paragraph' } ];
	tx.pushInsert( deParagraph );
	ops[ops.length - 1].data = ops[ops.length - 1].data.concat( deParagraph );
	diff += deParagraph.length;
	deepEqual( tx.getOperations(), ops, 'successive pushInsert calls are merged' );
	deepEqual(
		tx.getLengthDifference(),
		diff,
		'Successive insert operations increase the length difference correctly'
	);
	
	// Insert + Retain
	tx.pushRetain( 3 );
	ops.push( { 'type': 'retain', 'length': 3 } );
	deepEqual( tx.getOperations(), ops, 'pushRetain after pushInsert adds a retain operation' );
	deepEqual(
		tx.getLengthDifference(),
		diff,
		'pushRetain after pushInsert does not change length difference'
	);
	
	// Remove
	var hi = [ 'h', 'i' ];
	tx.pushRemove( hi );
	ops.push( { 'type': 'remove', 'data': hi } );
	diff -= hi.length;
	deepEqual( tx.getOperations(), ops, 'pushRemove adds a remove operation' );
	deepEqual( tx.getLengthDifference(), diff, 'pushRemove decreases the length difference' );
	
	// Multiple remove - this one is long on purpose, so the LD will drop below zero
	var jklmnopq = [ 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q' ];
	tx.pushRemove( jklmnopq );
	ops[ops.length - 1].data = ops[ops.length - 1].data.concat( jklmnopq );
	diff -= jklmnopq.length;
	deepEqual( tx.getOperations(), ops, 'successive remove operations are merged' );
	deepEqual(
		tx.getLengthDifference(),
		diff,
		'successive remove operations decrease the length difference correctly'
	);
	
	// Replace
	var rst = [ 'r', 's', 't' ], R = [ 'R' ];
	tx.pushReplace( rst, R );
	ops.push( { 'type': 'replace', 'remove': rst, 'replacement': R } );
	diff -= rst.length;
	diff += R.length;
	deepEqual( tx.getOperations(), ops, 'pushReplace adds a replace operation' );
	deepEqual(
		tx.getLengthDifference(),
		diff,
		'pushReplace change the length difference correctly'
	);
	
	// Multiple replace
	var uv = [ 'u', 'v' ], UVWUVWUV = [ 'U', 'V', 'W', 'U', 'V', 'W', 'U', 'V' ];
	tx.pushReplace( uv, UVWUVWUV );
	ops.push( { 'type': 'replace', 'remove': uv, 'replacement': UVWUVWUV } );
	diff -= uv.length;
	diff += UVWUVWUV.length;
	deepEqual( tx.getOperations(), ops, 'successive replace operations are NOT merged' );
	deepEqual(
		tx.getLengthDifference(),
		diff,
		'successive replace operations change the length difference correctly'
	);
	
	// Replace attribute
	tx.pushReplaceElementAttribute( 'style', 'bullet', 'number' );
	ops.push( { 'type': 'attribute', 'key': 'style', 'from': 'bullet', 'to': 'number' } );
	deepEqual( tx.getOperations(), ops, 'pushReplaceElementAttribute adds an attribute operation' );
	deepEqual(
		tx.getLengthDifference(),
		diff,
		'attribute operations do not change the length difference'
	);
	
	// Replace multiple attributes
	tx.pushReplaceElementAttribute( 'level', 2, 3 );
	ops.push( { 'type': 'attribute', 'key': 'level', 'from': 2, 'to': 3 } );
	deepEqual( tx.getOperations(), ops, 'successive attribute operations are NOT merged' );
	deepEqual(
		tx.getLengthDifference(),
		diff,
		'successive attribute operations do not change the length difference'
	);
	
	// Annotation
	tx.pushStartAnnotating( 'set', { 'type': 'textStyle/bold' } );
	ops.push( {
		'type': 'annotate',
		'method': 'set',
		'bias': 'start',
		'annotation': { 'type': 'textStyle/bold' }
	} );
	deepEqual( tx.getOperations(), ops, 'pushStartAnnotating adds an annotate operation' );
	deepEqual(
		tx.getLengthDifference(),
		diff,
		'annotate operations do not change the length difference'
	);
	
	// Multiple annotations
	tx.pushStartAnnotating( 'clear', { 'type': 'textStyle/italic' } );
	ops.push( {
		'type': 'annotate',
		'method': 'clear',
		'bias': 'start',
		'annotation': { 'type': 'textStyle/italic' }
	} );
	deepEqual( tx.getOperations(), ops, 'successive annotate operations are combined into one' );
	deepEqual(
		tx.getLengthDifference(),
		diff,
		'successive annotate operations do not change the length difference'
	);
} );
