<?php

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
			$output->addModules( array( 'ext.visualEditor.editPageInit' ) );
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

	/**
	 * Prevents editing in the VisualEditor namespace by non-sysop users.
	 *
	 * This is attached to the MediaWiki 'userCan' hook.
	 */
	public static function onUserCan( &$title, &$user, $action, &$result ) {
		global $wgUser, $wgNamespaceProtection;

		if ( array_key_exists( $title->mNamespace, $wgNamespaceProtection ) ) {
			$nsProt = $wgNamespaceProtection[$title->mNamespace];
			if ( !is_array( $nsProt ) ) {
				$nsProt = array( $nsProt );
			}
			foreach( $nsProt as $right ) {
				if ( $right != '' && !$user->isAllowed( $right ) ) {
					$result = false;
				}
			}
		}
		return true;
	}
}
