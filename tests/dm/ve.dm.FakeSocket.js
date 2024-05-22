/*!
 * VisualEditor DataModel Fake socket.io-like class for testing
 *
 * @copyright See AUTHORS.txt
 */

// Fake socket class, with limited API
ve.dm.FakeSocket = function VeDmFakeSocket( server, query ) {
	server.sockets.sockets.push( this );
	this.handlers = new Map();
	this.rooms = new Set();
	this.pending = [];
	this.handshake = { query: query, url: 'fakeurl' };
	this.client = { conn: { remoteAddress: 'fakeaddress' } };
	this.storedDataForDoc = {};
	this.dataForDoc = undefined;
	this.log = [];
};

OO.initClass( ve.dm.FakeSocket );

ve.dm.FakeSocket.static.makeServer = function () {
	const sockets = [],
		log = [];

	const getRoom = function ( roomName ) {
		return { emit: ( ...args ) => {
			sockets.forEach( ( socket ) => {
				if ( socket.rooms.has( roomName ) ) {
					socket.emit( ...args );
				}
			} );
		} };
	};
	const reset = function () {
		sockets.length = 0;
		log.length = 0;
	};
	return { sockets: { sockets: sockets, log: log, in: getRoom, reset: reset } };
};

ve.dm.FakeSocket.prototype.join = function ( roomName ) {
	this.rooms.add( roomName );
};

ve.dm.FakeSocket.prototype.emit = function ( eventName, ...args ) {
	const handlers = this.handlers.get( eventName ) || [];
	handlers.forEach( ( handler ) => {
		this.pending.push( handler( ...args ) );
	} );
};

ve.dm.FakeSocket.prototype.on = function ( eventName, handler ) {
	if ( !this.handlers.has( eventName ) ) {
		this.handlers.set( eventName, [] );
	}
	this.handlers.get( eventName ).push( handler );
};

ve.dm.FakeSocket.prototype.receive = function ( eventName, ...args ) {
	const handlers = this.handlers.get( eventName ) || [];
	handlers.forEach( ( handler ) => {
		this.pending.push( handler( ...args ) );
	} );
};

ve.dm.FakeSocket.prototype.wait = function () {
	return Promise.all( this.pending );
};
