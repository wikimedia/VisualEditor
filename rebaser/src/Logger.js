var fs = require( 'fs' );

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
		// e.g. ve.dm.Change
		if ( event[ key ].serialize ) {
			ob[ key ] = event[ key ].serialize( true );
		} else {
			ob[ key ] = event[ key ];
		}
	}
	this.logEvent( ob );
};

module.exports = Logger;
