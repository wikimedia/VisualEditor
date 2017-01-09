/*!
 * VisualEditor rebase server script.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* eslint-disable no-console */

var rebaseServer, pendingForDoc, artificialDelay, logStream, handlers,
	port = 8081,
	fs = require( 'fs' ),
	express = require( 'express' ),
	app = express(),
	url = require( 'url' ),
	http = require( 'http' ).Server( app ),
	io = require( 'socket.io' )( http ),
	ve = require( '../dist/ve-rebaser.js' ),
	docNamespaces = new Map(),
	lastAuthorForDoc = new Map();

function logEvent( event ) {
	if ( !logStream ) {
		logStream = fs.createWriteStream( 'rebaser.log', { flags: 'a' } );
	}
	logStream.write( JSON.stringify( event ) + '\n' );
}

function logServerEvent( event ) {
	var key;
	for ( key in event ) {
		if ( event[ key ] instanceof ve.dm.Change ) {
			event[ key ] = event[ key ].serialize( true );
		}
	}
	event.clientId = 'server';
	logEvent( event );
}

function wait( timeout ) {
	return new Promise( function ( resolve ) {
		setTimeout( resolve, timeout );
	} );
}

function logError( err ) {
	console.log( err.stack );
}

rebaseServer = new ve.dm.RebaseServer( logServerEvent );
docNamespaces = new Map();
lastAuthorForDoc = new Map();
pendingForDoc = new Map();
artificialDelay = parseInt( process.argv[ 2 ] ) || 0;

function* welcomeNewClient( socket, docName, author ) {
	var state, authorData;
	yield rebaseServer.updateDocState( docName, author, null, {
		displayName: 'User ' + author // TODO: i18n
	} );

	state = yield rebaseServer.getDocState( docName );
	authorData = state.authors.get( author );

	socket.emit( 'registered', {
		authorId: author,
		authorName: authorData.displayName,
		token: authorData.token
	} );
	docNamespaces.get( docName ).emit( 'nameChange', {
		authorId: author,
		authorName: authorData.displayName
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
}

function* onSubmitChange( context, data ) {
	var change, applied;
	yield wait( artificialDelay );
	change = ve.dm.Change.static.deserialize( data.change, null, true );
	applied = yield rebaseServer.applyChange( context.docName, context.author, data.backtrack, change );
	if ( !applied.isEmpty() ) {
		docNamespaces.get( context.docName ).emit( 'newChange', applied.serialize( true ) );
	}
}

function* onChangeName( context, newName ) {
	yield rebaseServer.updateDocState( context.docName, context.author, null, {
		displayName: newName
	} );
	docNamespaces.get( context.docName ).emit( 'nameChange', {
		authorId: context.author,
		authorName: newName
	} );
	logServerEvent( {
		type: 'nameChange',
		doc: context.docName,
		author: context.author,
		newName: newName
	} );
}

function* onUsurp( context, data ) {
	var state = yield rebaseServer.getDocState( context.docName ),
		newAuthorData = state.authors.get( data.authorId );
	if ( newAuthorData.token !== data.token ) {
		context.socket.emit( 'usurpFailed' );
		return;
	}
	yield rebaseServer.updateDocState( context.docName, data.authorId, null, {
		active: true
	} );
	// TODO either delete this author, or reimplement usurp in a client-initiated way
	yield rebaseServer.updateDocState( context.docName, context.author, null, {
		active: false
	} );
	context.socket.emit( 'registered', {
		authorId: data.authorId,
		authorName: newAuthorData.displayName,
		token: newAuthorData.token
	} );
	docNamespaces.get( context.docName ).emit( 'nameChange', {
		authorId: data.authorId,
		authorName: newAuthorData.displayName
	} );
	docNamespaces.get( context.docName ).emit( 'authorDisconnect', context.author );

	context.author = data.authorId;
}

function* onDisconnect( context ) {
	yield rebaseServer.updateDocState( context.docName, context.author, null, {
		active: false
	} );
	docNamespaces.get( context.docName ).emit( 'authorDisconnect', context.author );
	logServerEvent( {
		type: 'disconnect',
		doc: context.docName,
		author: context.author
	} );
}

function addStep( docName, generatorFunc ) {
	var pending = Promise.resolve( pendingForDoc.get( docName ) );
	pending = pending
		.then( function () {
			return ve.spawn( generatorFunc );
		} )
		.catch( logError );
	pendingForDoc.set( pending );
}

handlers = {
	submitChange: onSubmitChange,
	changeName: onChangeName,
	usurp: onUsurp,
	disconnect: onDisconnect
};

function handleEvent( context, eventName, data ) {
	addStep( context.docName, handlers[ eventName ]( context, data ) );
}

function makeConnectionHandler( docName ) {
	return function handleConnection( socket ) {
		// Allocate new author ID
		var context = {
				socket: socket,
				docName: docName,
				author: 1 + ( lastAuthorForDoc.get( docName ) || 0 )
			},
			eventName;
		lastAuthorForDoc.set( docName, context.author );
		logServerEvent( {
			type: 'newClient',
			doc: docName,
			author: context.author
		} );

		// Kick off welcome process
		addStep( docName, welcomeNewClient( socket, docName, context.author ) );

		// Attach event handlers
		for ( eventName in handlers ) {
			// eslint-disable-next-line no-loop-func
			socket.on( eventName, handleEvent.bind( null, context, eventName ) );
		}
		socket.on( 'logEvent', function ( event ) {
			event.clientId = context.author;
			event.doc = docName;
			logEvent( event );
		} );
	};
}

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

io.on( 'connection', function ( socket ) {
	var nsp,
		docName = url.parse( socket.handshake.url, true ).query.docName;

	if ( docName && !docNamespaces.has( docName ) ) {
		nsp = io.of( '/' + docName );
		docNamespaces.set( docName, nsp );
		nsp.on( 'connection', makeConnectionHandler( docName ) );
	}
} );

http.listen( port );
console.log( 'Listening on ' + port + ' (artificial delay ' + artificialDelay + ' ms)' );
