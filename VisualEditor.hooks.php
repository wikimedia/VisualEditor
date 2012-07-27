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

	public static function onResourceLoaderTestModules( array &$testModules, ResourceLoader &$resourceLoader ) {
		$testModules['qunit']['ext.visualEditor.test'] = array(
			'scripts' => array(
				// QUnit plugin
				've.qunit.js',
				// VisualEditor Tests
				've.example.js',
				've.Document.test.js',
				've.Node.test.js',
				've.BranchNode.test.js',
				've.LeafNode.test.js',
				've.Factory.test.js',
				// VisualEditor DataModel Tests
				'dm/ve.dm.example.js',
				'dm/ve.dm.NodeFactory.test.js',
				'dm/ve.dm.Node.test.js',
				'dm/ve.dm.Converter.test.js',
				'dm/ve.dm.BranchNode.test.js',
				'dm/ve.dm.LeafNode.test.js',
				'dm/nodes/ve.dm.TextNode.test.js',
				'dm/ve.dm.Document.test.js',
				'dm/ve.dm.DocumentSynchronizer.test.js',
				'dm/ve.dm.Transaction.test.js',
				'dm/ve.dm.TransactionProcessor.test.js',
				'dm/ve.dm.Surface.test.js',
				// VisualEditor ContentEditable Tests
				'ce/ve.ce.test.js',
				'ce/ve.ce.Document.test.js',
				'ce/ve.ce.NodeFactory.test.js',
				'ce/ve.ce.Node.test.js',
				'ce/ve.ce.BranchNode.test.js',
				'ce/ve.ce.LeafNode.test.js',
				'ce/nodes/ve.ce.TextNode.test.js',
			),
			'dependencies' => array(
				'ext.visualEditor.core',
				'ext.visualEditor.viewPageTarget',
			),
			'localBasePath' => dirname( __FILE__ ) . '/modules/ve/test',
			'remoteExtPath' => 'VisualEditor/modules/ve/test',
		);

		return true;
	}
}
