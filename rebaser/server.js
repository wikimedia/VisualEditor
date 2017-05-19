/* eslint-disable no-console */

var rebaseServer, artificialDelay, logStream,
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

rebaseServer = new ve.dm.RebaseServer( logServerEvent );
artificialDelay = parseInt( process.argv[ 2 ] ) || 0;

function makeConnectionHandler( docName ) {
	return function handleConnection( socket ) {
		var history = rebaseServer.getDocState( docName ).history,
			author = 1 + ( lastAuthorForDoc.get( docName ) || 0 ),
			authorData = rebaseServer.getAuthorData( docName, author );
		lastAuthorForDoc.set( docName, author );
		rebaseServer.setAuthorName( docName, author, 'User ' + author ); // TODO: i18n
		logServerEvent( {
			type: 'newClient',
			doc: docName,
			author: author
		} );
		socket.emit( 'registered', {
			authorId: author,
			authorName: authorData.displayName,
			token: authorData.token
		} );
		docNamespaces.get( docName ).emit( 'nameChange', { authorId: author, authorName: authorData.displayName } );
		socket.on( 'usurp', function ( data ) {
			var newAuthorData = rebaseServer.getAuthorData( docName, data.authorId );
			if ( newAuthorData.token !== data.token ) {
				socket.emit( 'usurpFailed' );
				return;
			}
			newAuthorData.active = true;
			socket.emit( 'registered', {
				authorId: data.authorId,
				authorName: newAuthorData.displayName,
				token: newAuthorData.token
			} );
			docNamespaces.get( docName ).emit( 'nameChange', { authorId: data.authorId, authorName: newAuthorData.displayName } );
			docNamespaces.get( docName ).emit( 'authorDisconnect', author );
			rebaseServer.removeAuthor( docName, author );
			author = data.authorId;
		} );
		// HACK Catch the client up on the current state by sending it the entire history
		// Ideally we'd be able to initialize the client using HTML, but that's hard, see
		// comments in the /raw handler. Keeping an updated linmod on the server could be
		// feasible if TransactionProcessor was modified to have a "don't sync, just apply"
		// mode and ve.dm.Document was faked with { data: ..., metadata: ..., store: ... }
		socket.emit( 'initDoc', { history: history.serialize( true ), names: rebaseServer.getAllNames( docName ) } );
		socket.on( 'changeName', function ( newName ) {
			logServerEvent( {
				type: 'nameChange',
				doc: docName,
				author: author,
				newName: newName
			} );
			rebaseServer.setAuthorName( docName, author, newName );
			docNamespaces.get( docName ).emit( 'nameChange', { authorId: author, authorName: newName } );
		} );
		socket.on( 'submitChange', setTimeout.bind( null, function ( data ) {
			var change, applied;
			try {
				change = ve.dm.Change.static.deserialize( data.change, null, true );
				applied = rebaseServer.applyChange( docName, author, data.backtrack, change );
				if ( !applied.isEmpty() ) {
					docNamespaces.get( docName ).emit( 'newChange', applied.serialize( true ) );
				}
			} catch ( error ) {
				console.error( error.stack );
			}
		}, artificialDelay ) );
		socket.on( 'logEvent', function ( event ) {
			event.clientId = author;
			event.doc = docName;
			logEvent( event );
		} );
		socket.on( 'disconnect', function () {
			var authorData = rebaseServer.getAuthorData( docName, author );
			authorData.active = false;
			docNamespaces.get( docName ).emit( 'authorDisconnect', author );
			logServerEvent( {
				type: 'disconnect',
				doc: docName,
				author: author
			} );
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
