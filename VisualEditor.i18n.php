<?php
$messages = array();
array_map( function ( $dir ) use ( &$messages ) {
	$files = glob( __DIR__ . "/$dir/*.json" );
	foreach ( $files as $file ) {
		$langcode = substr( basename( $file ), 0, -5 );
		$data = json_decode( file_get_contents( $file ), /* $assoc = */ true );
		unset( $data['@metadata'] );
		$messages[$langcode] = isset( $messages[$langcode] ) ?
			array_merge( $messages[$langcode], $data ) :
			$data;
	}
}, array(
	'modules/oojs-ui/i18n',
	'modules/ve/i18n',
	'modules/ve-mw/i18n',
	'modules/ve-wmf/i18n'
) );
