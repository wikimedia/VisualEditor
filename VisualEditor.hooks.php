<?php
/**
 * VisualEditor extension hooks
 *
 * @file
 * @ingroup Extensions
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

class VisualEditorHooks {
	/**
	 * Adds VisualEditor JS to the output if in the correct namespace.
	 *
	 * This is attached to the MediaWiki 'BeforePageDisplay' hook.
	 *
	 * @param $output OutputPage
	 * @param $skin Skin
	 */
	public static function onBeforePageDisplay( &$output, &$skin ) {
		global $wgTitle;
		if (
			// Vector skin supported for now.
			$skin->getSkinName() === 'vector' &&
			(
				// Article in the VisualEditor namespace
				$wgTitle->getNamespace() === NS_VISUALEDITOR ||
				// Special page action for an article in the VisualEditor namespace
				$skin->getRelevantTitle()->getNamespace() === NS_VISUALEDITOR
			)
		) {
			$output->addModules( array( 'ext.visualEditor.viewPageTarget' ) );
		}
		return true;
	}

	/**
	 * Adds extra variables to the page config.
	 *
	 * This is attached to the MediaWiki 'MakeGlobalVariablesScript' hook.
	 */
	public static function onMakeGlobalVariablesScript( &$vars ) {
		global $wgUser, $wgTitle;
		$vars['wgVisualEditor'] = array(
			'isPageWatched' => $wgUser->isWatched( $wgTitle )
		);
		return true;
	}
}
