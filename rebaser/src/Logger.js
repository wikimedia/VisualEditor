function Logger( logger ) {
	this.logger = logger;
	this.startTimestamp = null;
}

Logger.prototype.getRelativeTimestamp = function () {
	return Date.now() - this.startTimestamp;
};

/**
 * @param {Object} event The event to log
 * @param {string} [level] Log level
 */
Logger.prototype.logEvent = function ( event, level ) {
	this.logger.log( level || 'trace', event );
};

/**
 * Log a server event
 *
 * @param {Object} event The server event to log
 * @param {string} [level] Log level
 */
Logger.prototype.logServerEvent = function ( event, level ) {
	var key,
		ob = {};
	ob.clientId = 'server';
	for ( key in event ) {
		// e.g. ve.dm.Change
		if ( event[ key ].serialize ) {
			ob[ key ] = event[ key ].serialize( true );
		} else {
			ob[ key ] = event[ key ];
		}
	}
	this.logEvent( ob, level );
};

module.exports = Logger;
