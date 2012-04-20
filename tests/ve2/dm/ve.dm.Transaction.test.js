module( 've.dm.Transaction' );

test( 've.dm.Transaction', function() {
	var tx = new ve.dm.Transaction(), expectedOps = [], expectedLD = 0;
	deepEqual( tx.getOperations(), expectedOps, 'New Transaction object has no operations' );
	deepEqual( tx.getLengthDifference(), expectedLD, 'New Transaction object has length difference zero' );
	
	tx.pushRetain( 5 );
	expectedOps.push( { 'type': 'retain', 'length': 5 } );
	deepEqual( tx.getOperations(), expectedOps, 'pushRetain adds a retain operation' );
	deepEqual( tx.getLengthDifference(), expectedLD, 'Retain operations do not affect the length difference' );
	
	tx.pushRetain( 3 );
	expectedOps[expectedOps.length - 1].length += 3;
	deepEqual( tx.getOperations(), expectedOps, 'Successive retain operations are combined into one' );
	deepEqual( tx.getLengthDifference(), expectedLD, 'Successive retain operations do not affect the length difference' );
	
	var abcParagraph = [ { 'type': 'paragraph' }, 'a', 'b', 'c', { 'type': '/paragraph' } ];
	tx.pushInsert( abcParagraph );
	expectedOps.push( { 'type': 'insert', 'data': abcParagraph } );
	expectedLD += abcParagraph.length;
	deepEqual( tx.getOperations(), expectedOps, 'pushInsert adds an insert operation' );
	deepEqual( tx.getLengthDifference(), expectedLD, 'pushInsert updates the length difference' );
	
	var deParagraph = [ { 'type': 'paragraph' }, 'd', 'e', { 'type': '/paragraph' } ];
	tx.pushInsert( deParagraph );
	expectedOps[expectedOps.length - 1].data = expectedOps[expectedOps.length - 1].data.concat( deParagraph );
	expectedLD += deParagraph.length;
	deepEqual( tx.getOperations(), expectedOps, 'Successive insert operations are combined into one' );
	deepEqual( tx.getLengthDifference(), expectedLD, 'Successive insert operations update the length difference correctly' );
	
	tx.pushRetain( 3 );
	expectedOps.push( { 'type': 'retain', 'length': 3 } );
	deepEqual( tx.getOperations(), expectedOps, 'pushRetain adds a retain operation' );
	deepEqual( tx.getLengthDifference(), expectedLD, 'Retain operations do not affect the length difference' );
	
	var hi = [ 'h', 'i' ];
	tx.pushRemove( hi );
	expectedOps.push( { 'type': 'remove', 'data': hi } );
	expectedLD -= hi.length;
	deepEqual( tx.getOperations(), expectedOps, 'pushRemove adds a remove operation' );
	deepEqual( tx.getLengthDifference(), expectedLD, 'pushRemove updates the length difference' );
	
	// This one is long on purpose, so the LD will drop below zero
	var jklmnopq = [ 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q' ];
	tx.pushRemove( jklmnopq );
	expectedOps[expectedOps.length - 1].data = expectedOps[expectedOps.length - 1].data.concat( jklmnopq );
	expectedLD -= jklmnopq.length;
	deepEqual( tx.getOperations(), expectedOps, 'Successive remove operations are combined into one' );
	deepEqual( tx.getLengthDifference(), expectedLD, 'Successive remove operations update the length difference correctly' );
	
	var rst = [ 'r', 's', 't' ], R = [ 'R' ];
	tx.pushReplace( rst, R );
	expectedOps.push( { 'type': 'replace', 'remove': rst, 'replacement': R } );
	expectedLD -= rst.length;
	expectedLD += R.length;
	deepEqual( tx.getOperations(), expectedOps, 'pushReplace adds a replace operation' );
	deepEqual( tx.getLengthDifference(), expectedLD, 'pushReplace updates the length difference' );
	
	var uv = [ 'u', 'v' ], UVWUVWUV = [ 'U', 'V', 'W', 'U', 'V', 'W', 'U', 'V' ];
	tx.pushReplace( uv, UVWUVWUV );
	expectedOps.push( { 'type': 'replace', 'remove': uv, 'replacement': UVWUVWUV } );
	expectedLD -= uv.length;
	expectedLD += UVWUVWUV.length;
	deepEqual( tx.getOperations(), expectedOps, 'Successive replace operations are NOT combined into one' );
	deepEqual( tx.getLengthDifference(), expectedLD, 'Successive replace operations update the length difference correctly' );
	
	tx.pushReplaceElementAttribute( 'style', 'bullet', 'number' );
	expectedOps.push( { 'type': 'attribute', 'key': 'style', 'from': 'bullet', 'to': 'number' } );
	deepEqual( tx.getOperations(), expectedOps, 'pushReplaceElementAttribute adds an attribute operation' );
	deepEqual( tx.getLengthDifference(), expectedLD, 'Attribute operations do not affect the length difference' );
	
	tx.pushReplaceElementAttribute( 'level', 2, 3 );
	expectedOps.push( { 'type': 'attribute', 'key': 'level', 'from': 2, 'to': 3 } );
	deepEqual( tx.getOperations(), expectedOps, 'Successive attribute operations are NOT combined into one' );
	deepEqual( tx.getLengthDifference(), expectedLD, 'Successive attribute operations do not affect the length difference' );
	
	tx.pushStartAnnotating( 'set', { 'type': 'textStyle/bold' } );
	expectedOps.push( { 'type': 'annotate', 'method': 'set', 'bias': 'start', 'annotation': { 'type': 'textStyle/bold' } } );
	deepEqual( tx.getOperations(), expectedOps, 'pushStartAnnotating adds an annotate operation' );
	deepEqual( tx.getLengthDifference(), expectedLD, 'Annotate operations do not affect the length difference' );
	
	tx.pushStartAnnotating( 'clear', { 'type': 'textStyle/italic' } );
	expectedOps.push( { 'type': 'annotate', 'method': 'clear', 'bias': 'start', 'annotation': { 'type': 'textStyle/italic' } } );
	deepEqual( tx.getOperations(), expectedOps, 'Successive annotate operations are combined into one' );
	deepEqual( tx.getLengthDifference(), expectedLD, 'Successive annotate operations do not affect the length difference' );
} );

