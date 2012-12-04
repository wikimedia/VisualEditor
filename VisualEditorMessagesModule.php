<?php
/**
 * Resource loader module for certain VisualEditor messages.
 *
 * @file
 * @ingroup Extensions
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Module for special messages VisualEditor needs to have parsed server side.
 */
class VisualEditorMessagesModule extends ResourceLoaderModule {

	/* Protected Members */

	protected $origin = self::ORIGIN_USER_SITEWIDE;

	/* Methods */

	public function getScript( ResourceLoaderContext $context ) {
		$parsedMesssages = array();
		foreach ( $this>getMessages() as $msgKey ) {
			$parsedMesssages[$msgKey] = wfMessage( $msgKey )->parse();
		}
		return 've.init.target.addParsedMessages(' . FormatJson::encode( $parsedMesssages ) . ');';
	}

	public function getMessages() {
		// We don't actually enable the client-side message system for these messages.
		// But registering them in this standardised method to make use of the getMsgBlobMtime
		// utility for make cache invalidation work out-of-the-box.
		return array( 'minoredit', 'watchthis' );
	}

	public function getDependencies() {
		return array( 'ext.visualEditor.base' );
	}

	public function getModifiedTime( ResourceLoaderContext $context ) {
		return max(
			$this->getMsgBlobMtime( $context->getLanguage() ),
			// Also invalidate this module if this file changes (i.e. when messages were
			// added or removed, or when the javascript invocation in getScript is changes).
			file_exists( __FILE__ )  ? filemtime( __FILE__ ) : 1 // use 1 because 0 = now, would invalidate continously
		);
	}
}
