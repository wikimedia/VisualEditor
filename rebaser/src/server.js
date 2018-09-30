/*!
 * VisualEditor rebase server script.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* eslint-disable no-console */

var logger, protocolServer, transportServer,
	port = 8081,
	fs = require( 'fs' ),
	express = require( 'express' ),
	app = express(),
	http = require( 'http' ).Server( app ),
	io = require( 'socket.io' )( http ),
	ve = require( '../../dist/ve-rebaser.js' );

function Logger( filename ) {
	this.filename = filename;
	this.logStream = null;
	this.startTimestamp = null;
}

Logger.prototype.getRelativeTimestamp = function () {
	return Date.now() - this.startTimestamp;
};

/**
 * @param {Object} event The event to log
 */
Logger.prototype.logEvent = function ( event ) {
	if ( !this.logStream ) {
		this.logStream = fs.createWriteStream( 'rebaser.log', { flags: 'a' } );
	}
	this.logStream.write( JSON.stringify( event ) + '\n' );
};

/**
 * Log a server event
 *
 * @param {Object} event The server event to log
 */
Logger.prototype.logServerEvent = function ( event ) {
	var key,
		ob = {};
	ob.timestamp = this.getRelativeTimestamp();
	ob.clientId = 'server';
	for ( key in event ) {
		if ( event[ key ] instanceof ve.dm.Change ) {
			ob[ key ] = event[ key ].serialize( true );
		} else {
			ob[ key ] = event[ key ];
		}
	}
	this.logEvent( ob );
};

app.use( express.static( __dirname + '/../..' ) );
app.set( 'view engine', 'ejs' );

app.get( '/', function ( req, res ) {
	res.render( 'index' );
} );

app.get( new RegExp( '/doc/edit/(.*)' ), function ( req, res ) {
	var docName = req.params[ 0 ];
	res.render( 'editor', { docName: docName } );
} );

app.get( new RegExp( '/doc/raw/(.*)' ), function ( req, res ) {
	// TODO return real data
	// In order to provide HTML here, we'd need all of ve.dm (Document, Converter, all nodes)
	// and none of that code is likely to work in nodejs without some work because of how heavily
	// it uses the DOM.
	// var docName = req.params[ 0 ];
	res.status( 401 ).send( 'DOM in nodejs is hard' );
} );

logger = new Logger( 'rebaser.log' );
protocolServer = new ve.dm.ProtocolServer( logger );
transportServer = new ve.dm.TransportServer( protocolServer );
io.on(
	'connection',
	transportServer.onConnection.bind(
		transportServer,
		io.sockets.in.bind( io.sockets )
	)
);
http.listen( port );
console.log( 'Listening on ' + port );
