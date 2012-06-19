module( 've.dm.Surface' );

ve.dm.SurfaceStub = function( data ) {
	// Inheritance

	if ( data !== undefined ) {
		this.dm = new ve.dm.Document ( data );
	} else {
		this.dm = new ve.dm.Document ( [{ 'type': 'paragraph' }, 'h', 'i', { 'type': '/paragraph' }] );
	}
	ve.dm.Surface.call( this, this.dm );
};

// Inheritance

ve.extendClass( ve.dm.SurfaceStub, ve.dm.Surface );

// Tests

test( 'getDocument', 1, function() {
	var surface = new ve.dm.SurfaceStub();
	strictEqual( surface.getDocument(), surface.documentModel );
} );

test( 'getSelection', 1, function() {
	var surface = new ve.dm.SurfaceStub();
	strictEqual( surface.getSelection(), surface.selection );
} );

test( 'change', 3, function() {
	var surface = new ve.dm.SurfaceStub(),
		tx = new ve.dm.Transaction(),
		events = { 'transact': 0, 'select': 0, 'change': 0 };
	surface.on( 'transact', function() {
		events.transact++;
	} );
	surface.on( 'select', function() {
		events.select++;
	} );
	surface.on( 'change', function() {
		events.change++;
	} );
	surface.change( tx );
	deepEqual( events, { 'transact': 1, 'select': 0, 'change': 1 } );
	surface.change( null, new ve.Range( 1, 1 ) );
	deepEqual( events, { 'transact': 1, 'select': 1, 'change': 2 } );
	surface.change( tx, new ve.Range( 2, 2 ) );
	deepEqual( events, { 'transact': 2, 'select': 2, 'change': 3 } );
} );

test( 'annotate', 1, function() {
	var surface,
		cases = [
		{
			'msg': 'Set Bold',
			'data': [
				'b', 'o', 'l', 'd'
			],
			'expected':
			[
				[
					"b",
						{
							"{\"type\":\"textStyle/bold\"}": {
								"type": "textStyle/bold"
							}
						}
				],
				[
					"o",
						{
							"{\"type\":\"textStyle/bold\"}": {
								"type": "textStyle/bold"
							}
						}
				],
				[
					"l",
						{
							"{\"type\":\"textStyle/bold\"}": {
								"type": "textStyle/bold"
							}
						}
				],
				[
					"d",
						{
							"{\"type\":\"textStyle/bold\"}": {
								"type": "textStyle/bold"
							}
						}
				]
			],
			'annotate': {
				'method': 'set',
				'annotation': { 'type': 'textStyle/bold' }
			}
		}
	];

	expect( cases.length );
	for ( var i = 0; i < cases.length; i++ ) {
		surface = new ve.dm.SurfaceStub( cases[i].data );
		surface.change( null, new ve.Range( 0, surface.getDocument().getData().length ) );
		surface.annotate( cases[i].annotate['method'], cases[i].annotate['annotation'] );
		deepEqual( surface.getDocument().getData(), cases[i].expected, cases[i].msg );

	}
} );
