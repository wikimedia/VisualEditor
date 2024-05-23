#!/usr/bin/env node

'use strict';

const mongodb = require( 'mongodb' );

new mongodb.MongoClient(
	new mongodb.Server( 'localhost', 27017 ),
	// eslint-disable-next-line camelcase
	{ native_parser: true }
).connect().then( ( client ) => {
	const db = client.db( 'test' );
	return db.collection( 'vedocstore' ).find().toArray().then( ( result ) => {
		console.log( JSON.stringify( result ) );
		client.close();
	} );
} ).catch( ( err ) => {
	console.error( err );
} );
