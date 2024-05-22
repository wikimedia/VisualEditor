/*!
 * VisualEditor FakePeer tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.FakePeer' );

QUnit.test( 'interactions', ( assert ) => {
	const log = [];
	const done = assert.async();
	const finalCheck = function () {
		const expectedLog = [
			'peer0open p0',
			'peer1open p1',
			'peer0conn',
			'conn1open',
			'conn0open',
			'conn1data hello'
		];
		assert.deepEqual( log, expectedLog, 'log' );
		done();
	};

	const mkPeer = function () {
		// return new Peer( undefined, { host: 'localhost', port: 9000, path: '/myapp' } );
		return new ve.FakePeer();
	};
	const peer0 = mkPeer();
	peer0.on( 'open', ( peer0Id ) => {
		log.push( 'peer0open ' + peer0Id );
		const peer1 = mkPeer();
		peer1.on( 'open', ( id ) => {
			log.push( 'peer1open ' + id );
			const conn1 = peer1.connect( peer0Id );
			conn1.on( 'open', () => {
				log.push( 'conn1open' );
			} );
			conn1.on( 'data', ( data ) => {
				log.push( 'conn1data ' + data );
				finalCheck();
			} );
		} );
	} );
	peer0.on( 'connection', ( conn0 ) => {
		log.push( 'peer0conn' );
		conn0.on( 'open', () => {
			log.push( 'conn0open' );
			conn0.send( 'hello' );
		} );
		conn0.on( 'data', ( data ) => {
			log.push( 'conn0data ' + data );
		} );
	} );
} );
