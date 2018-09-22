/*!
 * VisualEditor rebase server script.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* eslint-disable no-console */

var logStream, transportServer,
	port = 8081,
	startTimestamp,
	fs = require( 'fs' ),
	express = require( 'express' ),
	app = express(),
	http = require( 'http' ).Server( app ),
	io = require( 'socket.io' )( http ),
	ve = require( '../dist/ve-rebaser.js' );

function logEvent( event ) {
	if ( !logStream ) {
		logStream = fs.createWriteStream( 'rebaser.log', { flags: 'a' } );
	}
	logStream.write( JSON.stringify( event ) + '\n' );
}

function logServerEvent( event ) {
	var key,
		ob = {};
	ob.timestamp = Date.now() - startTimestamp;
	ob.clientId = 'server';
	for ( key in event ) {
		if ( event[ key ] instanceof ve.dm.Change ) {
			ob[ key ] = event[ key ].serialize( true );
		} else {
			ob[ key ] = event[ key ];
		}
	}
	logEvent( ob );
}

/**
 * Protocol server
 *
 * Handles the abstract protocol without knowing the specific transport
 */
function ProtocolServer() {
	this.rebaseServer = new ve.dm.RebaseServer( logServerEvent );
	this.lastAuthorForDoc = new Map();
}

ProtocolServer.static = {};

ProtocolServer.static.palette = [
	'1f77b4', 'ff7f0e', '2ca02c', 'd62728', '9467bd',
	'8c564b', 'e377c2', '7f7f7f', 'bcbd22', '17becf',
	'aec7e8', 'ffbb78', '98df8a', 'ff9896', 'c5b0d5',
	'c49c94', 'f7b6d2', 'c7c7c7', 'dbdb8d', '9edae5'
];

/**
 * Check the client's credentials, and return a connection context object
 *
 * If the client is not recognised and authenticated, a new client ID and token are assigned.
 *
 * @param {string} docName The document name
 * @param {number|null} authorId The author ID, if any
 * @param {token|null} token The secret token, if any
 *
 * @return {Object} The connection context
 */
ProtocolServer.prototype.authenticate = function ( docName, authorId, token ) {
	var context,
		state = this.rebaseServer.stateForDoc.get( docName ),
		authorData = state && state.authors.get( authorId );

	if ( !authorData || token !== authorData.token ) {
		authorId = 1 + ( this.lastAuthorForDoc.get( docName ) || 0 );
		this.lastAuthorForDoc.set( docName, authorId );
		token = Math.random().toString( 36 ).slice( 2 );
	}
	context = {
		docName: docName,
		authorId: authorId
	};
	logServerEvent( {
		type: 'newClient',
		doc: docName,
		authorId: context.authorId
	} );
	return context;
};

/**
 * Add an event to the log
 *
 * @param {Object} context The connection context
 * @param {Object} event Event data
 */
ProtocolServer.prototype.onLogEvent = function ( context, event ) {
	var key,
		ob = {};
	ob.recvTimestamp = Date.now() - startTimestamp;
	ob.clientId = context.authorId;
	ob.doc = context.docName;
	for ( key in event ) {
		ob[ key ] = event[ key ];
	}
	logEvent( ob );
};

/**
 * Setup author on the server and send initialization events
 *
 * @param {Object} context The connection context
 */
ProtocolServer.prototype.welcomeClient = function ( context ) {
	var state, authorData,
		docName = context.docName,
		authorId = context.authorId;

	console.log( 'connection ' + context.connectionId );
	this.rebaseServer.updateDocState( docName, authorId, null, {
		// TODO: i18n
		name: 'User ' + authorId,
		color: this.constructor.static.palette[
			authorId % this.constructor.static.palette.length
		],
		active: true
	} );

	state = this.rebaseServer.getDocState( docName );
	authorData = state.authors.get( authorId );

	context.sendAuthor( 'registered', {
		authorId: authorId,
		token: authorData.token
	} );
	context.broadcast( 'authorChange', {
		authorId: authorId,
		authorData: {
			name: authorData.name,
			color: authorData.color
		}
	} );
	// HACK Catch the client up on the current state by sending it the entire history
	// Ideally we'd be able to initialize the client using HTML, but that's hard, see
	// comments in the /raw handler. Keeping an updated linmod on the server could be
	// feasible if TransactionProcessor was modified to have a "don't sync, just apply"
	// mode and ve.dm.Document was faked with { data: …, metadata: …, store: … }
	context.sendAuthor( 'initDoc', {
		history: state.history.serialize( true ),
		authors: state.getActiveAuthors()
	} );
};

/**
 * Try to apply a received change, and broadcast the successful portion as rebased
 *
 * @param {Object} context The connection context
 * @param {Object} data The change data
 */
ProtocolServer.prototype.onSubmitChange = function ( context, data ) {
	var change, applied;
	change = ve.dm.Change.static.deserialize( data.change, null, true );
	applied = this.rebaseServer.applyChange( context.docName, context.authorId, data.backtrack, change );
	if ( !applied.isEmpty() ) {
		context.broadcast( 'newChange', applied.serialize( true ) );
	}
};

/**
 * Apply and broadcast an author change
 *
 * @param {Object} context The connection context
 * @param {string} newData The new author data
 */
ProtocolServer.prototype.onChangeAuthor = function ( context, newData ) {
	this.rebaseServer.updateDocState( context.docName, context.authorId, null, {
		displayName: newData.name,
		displayColor: newData.color
	} );
	context.broadcast( 'authorChange', {
		authorId: context.authorId,
		authorData: {
			name: newData.name,
			color: newData.color
		}
	} );
	logServerEvent( {
		type: 'authorChange',
		doc: context.docName,
		authorId: context.authorId,
		authorData: {
			name: newData.name,
			color: newData.color
		}
	} );
};

/**
 * Apply and broadcast a disconnection (which may be temporary)
 *
 * @param {Object} context The connection context
 */
ProtocolServer.prototype.onDisconnect = function ( context ) {
	console.log( 'disconnect ' + context.connectionId );
	this.rebaseServer.updateDocState( context.docName, context.authorId, null, {
		active: false,
		continueBase: null,
		rejections: null
	} );
	context.broadcast( 'authorDisconnect', context.authorId );
	logServerEvent( {
		type: 'disconnect',
		doc: context.docName,
		authorId: context.authorId
	} );
};

/**
 * Transport server for Socket IO transport
 *
 * @constructor
 */
function TransportServer() {
	this.protocolServer = new ProtocolServer();
	this.docNamespaces = new Map();
}

/**
 * Generic connection handler
 *
 * This just creates a namespace handler for the docName, if one does not already exist
 *
 * @param {Object} socket The io socket
 */
TransportServer.prototype.onConnection = function ( socket ) {
	var context,
		server = this.protocolServer,
		docName = socket.handshake.query.docName,
		authorId = +socket.handshake.query.authorId || null,
		token = socket.handshake.query.token || null;

	socket.join( docName );
	context = server.authenticate( docName, authorId, token );
	context.broadcast = function () {
		var room = io.sockets.in( docName );
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

app.use( express.static( __dirname + '/..' ) );
app.set( 'view engine', 'ejs' );

app.get( '/', function ( req, res ) {
	res.render( 'index' );
} );

app.get( '/doc/edit/:docName', function ( req, res ) {
	var docName = req.params.docName;
	res.render( 'editor', { docName: docName } );
} );

app.get( '/doc/raw/:docName', function ( req, res ) {
	// TODO return real data
	// In order to provide HTML here, we'd need all of ve.dm (Document, Converter, all nodes)
	// and none of that code is likely to work in nodejs without some work because of how heavily
	// it uses the DOM.
	res.status( 401 ).send( 'DOM in nodejs is hard' );
} );

transportServer = new TransportServer();
io.on( 'connection', transportServer.onConnection.bind( transportServer ) );

startTimestamp = Date.now();
logServerEvent( { type: 'restart' } );
http.listen( port );
console.log( 'Listening on ' + port );
