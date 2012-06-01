<?php

class VisualEditorHooks {
	/**
	 * Adds VisualEditor JS to the output if in the correct namespace
	 *
	 * @param $output OutputPage
	 * @param $skin Skin
	 */
	public static function onPageDisplay( &$output, &$skin ) {
		if ( self::loadVisualEditor( $output, $skin ) ) {
			$output->addModules( array( 'ext.visualEditor.core' ) );
		}
		return true;
	}

	/**
	 * Determines whether or not we should construct the loader.
	 *
	 * @param $output OutputPage
	 * @param $skin Skin
	 */
	public static function loadVisualEditor( &$output, &$skin ) {
		global $wgTitle;
		// Vector skin supported for now.
		if ( $skin->getSkinName() !== 'vector' ) {
			return false;
		}
		// Be sure current page is VisualEditor:Something
		if ( $wgTitle->getNamespace() !== NS_VISUALEDITOR ) {
			return false;
		}
		return true;
	}
	public static function makeGlobalScriptVariables( &$vars ) {
		global $wgUser, $wgTitle;
		$vars['vePageWatched'] = $wgUser->isWatched( $wgTitle ) ? true : false;
		return true;
	}
	/**
	 * 
	*/
	public static function namespaceProtection( &$title, &$user, $action, &$result ){
		global $wgUser, $wgNamespaceProtection;

		if ( array_key_exists( $title->mNamespace, $wgNamespaceProtection ) ) {
			$nsProt = $wgNamespaceProtection[ $title->mNamespace ];

			if ( !is_array($nsProt) ) $nsProt = array($nsProt);
				foreach( $nsProt as $right ) {
					if( '' != $right && !$user->isAllowed( $right ) ) {
						$result = false;
					}
				}
			}
		return true;
	}
}
