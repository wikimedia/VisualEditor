<?php
/**
 * Resource loader module for certain VisualEditor messages.
 *
 * @file
 * @ingroup Extensions
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
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
		$msgInfo = $this->getMessageInfo();
		$parsedMesssages = array();
		foreach ( $msgInfo['args'] as $msgKey => $msgArgs ) {
			$parsedMesssages[ $msgKey ] = call_user_func_array( 'wfMessage', $msgArgs )
				->inLanguage( $context->getLanguage() )
				->parse();
		}
		return 've.init.platform.addParsedMessages(' . FormatJson::encode( $parsedMesssages ) . ');';
	}

	protected function getMessageInfo() {
		$msgKeys = array();

		// Simple ones
		$msgArgs = array(
			'minoredit' => array( 'minoredit' ),
			'watchthis' => array( 'watchthis' ),
			'visualeditor-report-notice' => array( 'visualeditor-report-notice' ),
		);

		// Copyright warning (based on EditPage::getCopyrightWarning)
		global $wgRightsText;
		if ( $wgRightsText ) {
			$copywarnMsg = array( 'copyrightwarning',
				'[[' . wfMessage( 'copyrightpage' )->inContentLanguage()->text() . ']]',
				$wgRightsText );
		} else {
			$copywarnMsg = array( 'copyrightwarning2',
				'[[' . wfMessage( 'copyrightpage' )->inContentLanguage()->text() . ']]' );
		}
		// EditPage supports customisation based on title, we can't support that here
		// since these messages are cached on a site-level. $wgTitle is likely set to null.
		$title = Title::newFromText( 'Dwimmerlaik' );
		wfRunHooks( 'EditPageCopyrightWarning', array( $title, &$copywarnMsg ) );

		// Keys used in copyright warning
		$msgKeys[] = 'copyrightpage';
		$msgKeys[] = $copywarnMsg[0];
		// Normalise to 'copyrightwarning' so we have a consistent key in the front-end.
		$msgArgs[ 'copyrightwarning' ] = $copywarnMsg;

		$msgKeys = array_values( array_unique( array_merge( $msgKeys, array_keys( $msgArgs ) ) ) );

		return array(
			'keys' => $msgKeys,
			'args' => $msgArgs,
		);
	}

	public function getMessages() {
		// We don't actually use the client-side message system for these messages.
		// But we're registering them in this standardised method to make use of the
		// getMsgBlobMtime utility to make cache invalidation work out-of-the-box.

		$msgInfo = $this->getMessageInfo();
		return $msgInfo['keys'];
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
