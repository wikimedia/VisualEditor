<?php
/**
 * Wordbreak character groups generator
 *
 * @file
 * @copyright 2013 UnicodeJS team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

echo 'Downloading break point ranges from unicode.org...   ';
$data = file_get_contents( 'http://www.unicode.org/Public/UNIDATA/auxiliary/WordBreakProperty.txt' );
echo "done\n";

echo 'Generating regular expressions...   ';
$lines = explode( "\n", $data );

$groups = array();

for ( $i = 0, $len = count($lines); $i < $len; $i++ ) {
	$line = $lines[$i];
	if ( substr( $line, 0, 1 ) === '#' || $line === '' ) {
		continue;
	}
	$cols = preg_split( '/[;#]/', $line );
	// Ignoring non-BMP characters for the time being
	if ( preg_match( '/[a-f0-9]{5}/i', $cols[0] ) ) continue;
	$range = '\u'.str_replace( '..', '-\u', trim( $cols[0] ) );
	$group = trim( $cols[1] );
	if ( !isset( $groups[$group] ) ) {
		$groups[$group] = '';
	}
	$groups[$group] .= $range;
}

echo "done\n";

echo 'Writing to unicodejs.wordbreak.groups.js...   ';

$json = preg_replace( '/    /', "\t", json_encode( $groups, JSON_PRETTY_PRINT ) );
file_put_contents(
	dirname( __DIR__ ) . '/unicodejs.wordbreak.groups.js',
	"/*jshint quotmark:double */\nunicodeJS.groups = " . $json . ";\n"
);

echo "done\n";
