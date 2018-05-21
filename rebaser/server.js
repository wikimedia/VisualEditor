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

function ProtocolServer() {
	this.rebaseServer = new ve.dm.RebaseServer( logServerEvent );
	this.docNamespaces = new Map();
	this.lastAuthorForDoc = new Map();
}

ProtocolServer.static = {};
ProtocolServer.static.palette = [
	'1f77b4', 'ff7f0e', '2ca02c', 'd62728', '9467bd',
	'8c564b', 'e377c2', '7f7f7f', 'bcbd22', '17becf',
	'aec7e8', 'ffbb78', '98df8a', 'ff9896', 'c5b0d5',
	'c49c94', 'f7b6d2', 'c7c7c7', 'dbdb8d', '9edae5'
];

ProtocolServer.prototype.authenticate = function ( docName, socket ) {
	// HACK: Always succeed, with a new author ID
	var context = {
		docName: docName,
		socket: socket,
		authorId: 1 + ( this.lastAuthorForDoc.get( docName ) || 0 )
	};
	this.lastAuthorForDoc.set( docName, context.authorId );
	logServerEvent( {
		type: 'newClient',
		doc: docName,
		authorId: context.authorId
	} );
	return context;
};

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

ProtocolServer.prototype.welcomeNewClient = function ( context, socket ) {
	var state, authorData,
		docName = context.docName,
		authorId = context.authorId;
	this.rebaseServer.updateDocState( docName, authorId, null, {
		// TODO: i18n
		displayName: 'User ' + authorId,
		displayColor: this.constructor.static.palette[
			authorId % this.constructor.static.palette.length
		]
	} );

	state = this.rebaseServer.getDocState( docName );
	authorData = state.authors.get( authorId );

	socket.emit( 'registered', {
		authorId: authorId,
		authorName: authorData.displayName,
		authorColor: authorData.displayColor,
		token: authorData.token
	} );
	context.broadcast( 'nameChange', {
		authorId: authorId,
		authorName: authorData.displayName
	} );
	context.broadcast( 'colorChange', {
		authorId: authorId,
		authorColor: authorData.displayColor
	} );
	// HACK Catch the client up on the current state by sending it the entire history
	// Ideally we'd be able to initialize the client using HTML, but that's hard, see
	// comments in the /raw handler. Keeping an updated linmod on the server could be
	// feasible if TransactionProcessor was modified to have a "don't sync, just apply"
	// mode and ve.dm.Document was faked with { data: ..., metadata: ..., store: ... }
	socket.emit( 'initDoc', {
		history: state.history.serialize( true ),
		names: state.getActiveNames()
	} );
};

ProtocolServer.prototype.onSubmitChange = function ( context, data ) {
	var change, applied;
	change = ve.dm.Change.static.deserialize( data.change, null, true );
	applied = this.rebaseServer.applyChange( context.docName, context.authorId, data.backtrack, change );
	if ( !applied.isEmpty() ) {
		context.broadcast( 'newChange', applied.serialize( true ) );
	}
};

ProtocolServer.prototype.onChangeName = function ( context, newName ) {
	this.rebaseServer.updateDocState( context.docName, context.authorId, null, {
		displayName: newName
	} );
	this.docNamespaces.get( context.docName ).emit( 'nameChange', {
		authorId: context.authorId,
		authorName: newName
	} );
	logServerEvent( {
		type: 'nameChange',
		doc: context.docName,
		authorId: context.authorId,
		newName: newName
	} );
};

ProtocolServer.prototype.onChangeColor = function ( context, newColor ) {
	this.rebaseServer.updateDocState( context.docName, context.authorId, null, {
		displayColor: newColor
	} );
	context.broadcast( 'colorChange', {
		authorId: context.authorId,
		authorColor: newColor
	} );
	logServerEvent( {
		type: 'colorChange',
		doc: context.docName,
		authorId: context.authorId,
		newColor: newColor
	} );
};

ProtocolServer.prototype.onDisconnect = function ( context ) {
	console.log( 'disconnect ' + context.socket.client.conn.remoteAddress + ' ' + context.socket.handshake.url );
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

function TransportServer( protocolServer ) {
	this.protocolServer = protocolServer;
	this.docNamespaces = new Map();
}

TransportServer.prototype.onConnection = function ( socket ) {
	var namespace,
		docName = socket.handshake.query.docName;
	console.log( 'connection ' + socket.client.conn.remoteAddress + ' ' + socket.handshake.url );
	if ( docName && !this.docNamespaces.has( docName ) ) {
		namespace = io.of( '/' + docName );
		this.docNamespaces.set( docName, namespace );
		// We must bind methods separately, using a namespace handler, because
		// the socket object passed into namespace handlers is different
		namespace.on( 'connection', this.onDocConnection.bind( this, namespace ) );
	}
};

TransportServer.prototype.onDocConnection = function ( namespace, socket ) {
	var server = this.protocolServer,
		docName = socket.handshake.query.docName,
		context = server.authenticate( docName, socket );
	context.broadcast = namespace.emit.bind( namespace );
	socket.on( 'submitChange', server.onSubmitChange.bind( server, context ) );
	socket.on( 'changeName', server.onChangeName.bind( server, context ) );
	socket.on( 'changeColor', server.onChangeColor.bind( server, context ) );
	socket.on( 'disconnect', server.onDisconnect.bind( server, context ) );
	socket.on( 'logEvent', server.onLogEvent.bind( server, context ) );
	server.welcomeNewClient( context, socket );
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

transportServer = new TransportServer( new ProtocolServer() );
io.on( 'connection', transportServer.onConnection.bind( transportServer ) );

startTimestamp = Date.now();
logServerEvent( { type: 'restart' } );
http.listen( port );
console.log( 'Listening on ' + port );
