/*!
 * VisualEditor DataModel transport server tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.dm.TransportServer' );

QUnit.test( 'Create', ( assert ) => {
	const done = assert.async(),
		log = [],
		io = ve.dm.FakeSocket.static.makeServer();

	const protocolServer = {
		context: null,
		ensureLoaded: Promise.resolve.bind( Promise ),
		authenticate: function ( docName, authorId, token ) {
			const context = { docName: docName, authorId: authorId, token: token };
			log.push( [ 'authenticate', ve.copy( context ) ] );
			return context;
		},
		onSubmitChange: function ( context, data ) {
			log.push( [ 'submitChange', data ] );
			context.broadcast( 'newChange', data );
		},
		onLogEvent: function ( context, event ) {
			log.push( [ 'logEvent', event ] );
		},
		onChangeAuthor: function ( context, newData ) {
			log.push( [ 'changeAuthor', newData ] );
			context.broadcast( 'authorChange', newData );
		},
		onDisconnect: function ( context ) {
			log.push( [ 'disconnect' ] );
			context.broadcast( 'authorDisconnect', context.authorId );
		},
		welcomeClient: function ( context ) {
			this.context = context;
			context.sendAuthor( 'registered', context.authorId );
			context.broadcast( 'authorChange', context.authorId );
			context.sendAuthor( 'initDoc', 'fakedoccontents' );
		}
	};

	const transportServer = new ve.dm.TransportServer( protocolServer, protocolServer );
	const socket = new ve.dm.FakeSocket( io, { docName: 'Foo', authorId: 1, token: 'xxx' } );
	socket.on( 'registered', ( data ) => {
		log.push( [ 'registered', data ] );
	} );
	socket.on( 'authorChange', ( data ) => {
		log.push( [ 'broadcast', 'authorChange', data ] );
	} );
	socket.on( 'initDoc', ( data ) => {
		log.push( [ 'initDoc', data ] );
	} );
	socket.on( 'newChange', ( data ) => {
		log.push( [ 'broadcast', 'newChange', data ] );
	} );
	socket.on( 'authorDisconnect', ( authorId ) => {
		log.push( [ 'broadcast', 'authorDisconnect', authorId ] );
	} );

	transportServer.onConnection( io.sockets.in.bind( io.sockets ), socket ).then( () => {
		socket.receive( 'submitChange', 'foo' );
		socket.receive( 'logEvent', 'bar' );
		socket.receive( 'changeAuthor', 1 );
		socket.receive( 'disconnect' );
		return socket.wait();
	} ).then( () => {
		assert.deepEqual( log, [
			[ 'authenticate', { docName: 'Foo', authorId: 1, token: 'xxx' } ],
			[ 'registered', 1 ],
			[ 'broadcast', 'authorChange', 1 ],
			[ 'initDoc', 'fakedoccontents' ],
			[ 'submitChange', 'foo' ],
			[ 'broadcast', 'newChange', 'foo' ],
			[ 'logEvent', 'bar' ],
			[ 'changeAuthor', 1 ],
			[ 'broadcast', 'authorChange', 1 ],
			[ 'disconnect' ],
			[ 'broadcast', 'authorDisconnect', 1 ]
		], 'Correct events received in correct order' );
	} ).catch( ( err ) => {
		assert.true( false, 'Exception: ' + err );
	} ).finally( () => done() );
} );
