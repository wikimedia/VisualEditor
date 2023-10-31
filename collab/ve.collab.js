/*!
 * VisualEditor collab extensions.
 *
 * @copyright 2011-2023 VisualEditor Team and others; see http://ve.mit-license.org
 */

/* global Peer */

ve.collab = {};

/**
 * Recursively serialize objects into plain data.
 *
 * Non-plain objects must have a .serialize or .toJSON method.
 *
 * @param {Object|Array} value The value to serialize
 * @return {Object|Array} The serialized version
 */
ve.collab.serialize = function ( value ) {
	if ( Array.isArray( value ) ) {
		return value.map( function ( item ) {
			return ve.collab.serialize( item );
		} );
	} else if ( value === null || typeof value !== 'object' ) {
		return value;
	} else if ( value.constructor === Object ) {
		var serialized = {};
		for ( var property in value ) {
			serialized[ property ] = ve.collab.serialize( value[ property ] );
		}
		return serialized;
	} else if ( typeof value.serialize === 'function' ) {
		return ve.collab.serialize( value.serialize() );
	} else if ( typeof value.toJSON === 'function' ) {
		return ve.collab.serialize( value.toJSON() );
	}
	throw new Error( 'Cannot serialize ' + value );
};

ve.collab.newPeer = function () {
	// To use the public PeerJS server:
	return new Peer();
	// To use a local PeerJS server:
	// return new Peer( undefined, { host: 'localhost', port: 9000, path: '/myapp' } );
	// To use a ve.FakePeer (for debugging):
	// return new ve.FakePeer();
};

ve.collab.initPeerServer = function () {
	var surface = ve.init.target.surface,
		completeHistory = surface.model.documentModel.completeHistory;

	ve.collab.peerServer = new ve.dm.CollabTransportServer( completeHistory.getLength() );
	if ( completeHistory.getLength() > 0 ) {
		completeHistory.transactions[ 0 ].authorId = 1;
	}
	ve.collab.peerServer.protocolServer.rebaseServer.updateDocState(
		// The doc name is arbitrary since the in-browser server only serves one doc
		've-collab-doc',
		1,
		ve.dm.Change.static.deserialize( completeHistory.serialize(), true ),
		completeHistory,
		{}
	);
	ve.collab.peerServer.peer = ve.collab.newPeer();
	ve.collab.peerServer.peer.on( 'open', function ( id ) {
		/* eslint-disable-next-line no-console */
		console.log( 'Open. Now in another browser window, do:\nve.collab.initPeerClient( \'' + id + '\' );' );
		ve.collab.initPeerClient( id, true );
	} );
	ve.collab.peerServer.peer.on( 'connection', function ( conn ) {
		ve.collab.peerServer.onConnection( conn );
	} );
};

ve.collab.initPeerClient = function ( serverId, isMain ) {
	var surface = ve.init.target.surface,
		completeHistory = surface.model.documentModel.completeHistory,
		peerClient = ve.collab.newPeer();
	if ( completeHistory.getLength() > 0 ) {
		completeHistory.transactions[ 0 ].authorId = 1;
	}
	// HACK: Disable redo command until supported (T185706)
	ve.ui.commandRegistry.unregister( 'redo' );

	if ( !isMain ) {
		ve.ui.commandRegistry.unregister( 'showSave' );
		// eslint-disable-next-line no-jquery/no-global-selector
		$( '.ve-ui-toolbar-saveButton' ).css( 'text-decoration', 'line-through' );
	}
	ve.init.target.constructor.static.toolbarGroups = ve.copy( ve.init.target.constructor.static.toolbarGroups );
	ve.init.target.constructor.static.toolbarGroups.push( {
		name: 'authorList',
		include: [ 'authorList' ],
		position: 'after'
	} );

	peerClient.on( 'open', function ( /* id */ ) {
		var conn = peerClient.connect( serverId );
		// On old js-BinaryPack (before https://github.com/peers/js-binarypack/pull/10 ),
		// you need JSON serialization, else it crashes on Unicode code points over U+FFFF
		// var conn = peerClient.connect( serverId, { serialization: 'json' } );
		conn.on( 'open', function () {
			surface.model.createSynchronizer( 'foo', { peerConnection: conn } );
			surface.model.synchronizer.commitLength = completeHistory.getLength();
			surface.model.synchronizer.sentLength = completeHistory.getLength();
			surface.model.synchronizer.once( 'initDoc', function ( error ) {
				if ( error ) {
					OO.ui.alert(
						// eslint-disable-next-line no-jquery/no-append-html
						$( '<p>' ).append(
							ve.htmlMsg( 'visualeditor-rebase-corrupted-document-error', $( '<pre>' ).text( error.stack ) )
						),
						{ title: ve.msg( 'visualeditor-rebase-corrupted-document-title' ), size: 'large' }
					);
					return;
				}
				ve.init.target.getToolbar().setup(
					ve.init.target.constructor.static.toolbarGroups,
					ve.init.target.surface
				);
			} );
			ve.collab.connectModelSynchronizer();
		} );
	} );
};

ve.collab.connectModelSynchronizer = function () {
	var ceSurface = ve.init.target.surface.view;
	ceSurface.model.synchronizer.connect( ceSurface, {
		authorSelect: 'onSynchronizerAuthorUpdate',
		authorChange: 'onSynchronizerAuthorUpdate',
		authorDisconnect: 'onSynchronizerAuthorDisconnect',
		wrongDoc: 'onSynchronizerWrongDoc',
		pause: 'onSynchronizerPause'
	} );
};
