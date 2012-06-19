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

test( 'setSelection', 1, function() {
	var surface = new ve.dm.SurfaceStub();
	surface.on( 'select', function() {
		ok( true, 'select was emitted' );
	} );
	surface.setSelection( new ve.Range( 1, 1 ) );
} );

test( 'change', 2, function() {
	var surface = new ve.dm.SurfaceStub();
	var tx = new ve.dm.Transaction();
	surface.on( 'transact', function() {
		ok( true, 'transact was emitted' );
	} );
	surface.on( 'change', function() {
		ok( true, 'change was emitted' );
	} );
	surface.change( tx );
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
		surface.setSelection(new ve.Range( 0, surface.getDocument().getData().length ));
		surface.annotate( cases[i].annotate['method'], cases[i].annotate['annotation']);
		deepEqual(
			surface.getDocument().getData(), cases[i].expected, cases[i].msg
		);

	}
} );
