/*!
 * VisualEditor DataModel transport server class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Transport server for Socket IO transport
 *
 * @constructor
 * @param {ve.dm.ProtocolServer} protocolServer The protocol server
 */
ve.dm.TransportServer = function VeDmTransportServer( protocolServer ) {
	this.protocolServer = protocolServer;
};

OO.initClass( ve.dm.TransportServer );

/**
 * Generic connection handler
 *
 * This just creates a namespace handler for the docName, if one does not already exist
 *
 * @param {Function} getRoom One-argument function taking docName, returning the corresponding room
 * @param {Object} socket The io socket
 */
ve.dm.TransportServer.prototype.onConnection = function ( getRoom, socket ) {
	var context,
		server = this.protocolServer,
		docName = socket.handshake.query.docName,
		authorId = +socket.handshake.query.authorId || null,
		token = socket.handshake.query.token || null;

	socket.join( docName );
	context = server.authenticate( docName, authorId, token );
	context.broadcast = function () {
		var room = getRoom( docName );
		room.emit.apply( room, arguments );
	};
	context.sendAuthor = socket.emit.bind( socket );
	context.connectionId = socket.client.conn.remoteAddress + ' ' + socket.handshake.url;

	socket.on( 'submitChange', server.onSubmitChange.bind( server, context ) );
	socket.on( 'changeAuthor', server.onChangeAuthor.bind( server, context ) );
	socket.on( 'disconnect', server.onDisconnect.bind( server, context ) );
	socket.on( 'logEvent', server.onLogEvent.bind( server, context ) );
	server.welcomeClient( context );
};
