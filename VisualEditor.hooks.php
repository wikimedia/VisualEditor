<?php
/**
 * VisualEditor extension hooks
 *
 * @file
 * @ingroup Extensions
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

class VisualEditorHooks {
	/** List of skins VisualEditor integration supports */
	protected static $supportedSkins = array( 'vector', 'apex', 'monobook' );

	public static function onSetup() {
		global $wgVisualEditorEnableEventLogging, $wgResourceModules,
			$wgVisualEditorResourceTemplate;

		// This prevents VisualEditor from being run in environments that don't
		// have the dependent code in core; this should be updated as a part of
		// when additional dependencies are created and pushed into MediaWiki's
		// core. The most direct effect of this is to avoid confusing any third
		// parties who attempt to install VisualEditor onto non-alpha wikis, as
		// this should have no impact on deploying to Wikimedia's wiki cluster.
		// Is fine for release tarballs because 1.22wmf11 < 1.22alpha < 1.22.0.
		wfUseMW( '1.22wmf11' );

		if ( $wgVisualEditorEnableEventLogging ) {
			if ( class_exists( 'ResourceLoaderSchemaModule' ) ) {
				// EventLogging schema module for logging edit events.
				// See <http://meta.wikimedia.org/wiki/Schema:Edit>
				$wgResourceModules['schema.Edit'] = array(
					'class'  => 'ResourceLoaderSchemaModule',
					'schema' => 'Edit',
					'revision' => 5570274,
				);
			} else {
				wfWarn( 'VisualEditor is configured to use EventLogging, but the extension is ' .
						' not available. Disabling wgVisualEditorEnableEventLogging.' );
				$wgVisualEditorEnableEventLogging = false;
			}
		}
		// Only load jquery.ULS if ULS Extension isn't already installed:
		if ( !class_exists( 'UniversalLanguageSelectorHooks' ) ) {
			$wgResourceModules['jquery.uls'] = $wgVisualEditorResourceTemplate + array(
				'scripts' => array(
					'jquery.uls/src/jquery.uls.core.js',
					'jquery.uls/src/jquery.uls.lcd.js',
					'jquery.uls/src/jquery.uls.languagefilter.js',
					'jquery.uls/src/jquery.uls.regionfilter.js',
				),
				'styles' => array(
					'jquery.uls/css/jquery.uls.css',
					'jquery.uls/css/jquery.uls.lcd.css',
				),
				'dependencies' => array(
					'jquery.uls.grid',
					'jquery.uls.data',
					'jquery.uls.compact',
				),
			);
			$wgResourceModules['jquery.uls.data'] = $wgVisualEditorResourceTemplate + array(
				'scripts' => array(
					'jquery.uls/src/jquery.uls.data.js',
					'jquery.uls/src/jquery.uls.data.utils.js',
				),
				'position' => 'top',
			);
			$wgResourceModules['jquery.uls.grid'] = $wgVisualEditorResourceTemplate + array(
				'styles' => 'jquery.uls/css/jquery.uls.grid.css',
				'position' => 'top',
			);
			$wgResourceModules['jquery.uls.compact'] = $wgVisualEditorResourceTemplate + array(
				'styles' => 'jquery.uls/css/jquery.uls.compact.css',
				'position' => 'top',
			);
		}
	}

	/**
	 * Adds VisualEditor JS to the output if in the correct namespace.
	 *
	 * This is attached to the MediaWiki 'BeforePageDisplay' hook.
	 *
	 * @param $output OutputPage
	 * @param $skin Skin
	 */
	public static function onBeforePageDisplay( &$output, &$skin ) {
		global $wgVisualEditorNamespaces, $wgVisualEditorEnableEventLogging,
			$wgVisualEditorDisableForAnons;

		if ( $wgVisualEditorEnableEventLogging ) {
			$output->addModules( array( 'schema.Edit' ) );
		}

		$output->addModules( array( 'ext.visualEditor.viewPageTarget.init' ) );

		return true;
	}

	public static function onGetPreferences( $user, &$preferences ) {
		$preferences['visualeditor-enable'] = array(
			'type' => 'toggle',
			'label-message' => 'visualeditor-preference-enable',
			'section' => 'editing/beta'
		);
		$preferences['visualeditor-betatempdisable'] = array(
			'type' => 'toggle',
			'label-message' => 'visualeditor-preference-betatempdisable',
			'section' => 'editing/beta'
		);
		return true;
	}

	public static function onListDefinedTags( &$tags ) {
		$tags[] = 'visualeditor';
		$tags[] = 'visualeditor-needcheck';
		return true;
	}

	/**
	 * Adds extra variables to the page config.
	 */
	public static function onMakeGlobalVariablesScript( array &$vars, OutputPage $out ) {
		global $wgStylePath, $wgContLang;
		$vars['wgVisualEditor'] = array(
			'isPageWatched' => $out->getUser()->isWatched( $out->getTitle() ),
			// Same as in Linker.php
			'magnifyClipIconURL' => $wgStylePath .
				'/common/images/magnify-clip' .
				( $wgContLang->isRTL() ? '-rtl' : '' ) . '.png',
			'pageLanguageCode' => $out->getTitle()->getPageLanguage()->getHtmlCode(),
			'pageLanguageDir' => $out->getTitle()->getPageLanguage()->getDir(),
		);

		return true;
	}

	/**
	 * Adds extra variables to the global config
	 */
	public static function onResourceLoaderGetConfigVars( array &$vars ) {
		global $wgDefaultUserOptions,
			$wgVisualEditorDisableForAnons,
			$wgVisualEditorEnableEventLogging,
			$wgVisualEditorEnableExperimentalCode,
			$wgVisualEditorNamespaces,
			$wgVisualEditorPluginModules,
			$wgVisualEditorTabLayout;

		$vars['wgVisualEditorConfig'] = array(
			'disableForAnons' => $wgVisualEditorDisableForAnons,
			'enableEventLogging' => $wgVisualEditorEnableEventLogging,
			'enableExperimentalCode' => $wgVisualEditorEnableExperimentalCode,
			'namespaces' => $wgVisualEditorNamespaces,
			'pluginModules' => $wgVisualEditorPluginModules,
			'defaultUserOptions' => array(
				'enable' => $wgDefaultUserOptions['visualeditor-enable'],
				'betatempdisable' => $wgDefaultUserOptions['visualeditor-betatempdisable'],
			),
			'skins' => self::$supportedSkins,
			'tabLayout' => $wgVisualEditorTabLayout,
		);

		return true;
	}

	public static function onResourceLoaderTestModules(
		array &$testModules,
		ResourceLoader &$resourceLoader
	) {
		$testModules['qunit']['ext.visualEditor.test'] = array(
			'scripts' => array(
				// MW config preload
				've-mw/test/mw-preload.js',
				// QUnit plugin
				've/test/ve.qunit.js',
				// UnicodeJS Tests
				'unicodejs/test/unicodejs.test.js',
				'unicodejs/test/unicodejs.graphemebreak.test.js',
				'unicodejs/test/unicodejs.wordbreak.test.js',
				// VisualEditor Tests
				've/test/ve.test.utils.js',
				've/test/ve.test.js',
				've/test/ve.Document.test.js',
				've/test/ve.Element.test.js',
				've/test/ve.Node.test.js',
				've/test/ve.BranchNode.test.js',
				've/test/ve.LeafNode.test.js',
				've/test/ve.Factory.test.js',
				// VisualEditor DataModel Tests
				've/test/dm/ve.dm.example.js',
				've/test/dm/ve.dm.AnnotationSet.test.js',
				've/test/dm/ve.dm.NodeFactory.test.js',
				've/test/dm/ve.dm.Node.test.js',
				've/test/dm/ve.dm.Converter.test.js',
				've/test/dm/ve.dm.BranchNode.test.js',
				've/test/dm/ve.dm.LeafNode.test.js',
				've/test/dm/ve.dm.LinearData.test.js',
				've/test/dm/nodes/ve.dm.TextNode.test.js',
				've-mw/test/dm/nodes/ve.dm.MWTransclusionNode.test.js',
				've/test/dm/ve.dm.Document.test.js',
				've/test/dm/ve.dm.DocumentSynchronizer.test.js',
				've/test/dm/ve.dm.IndexValueStore.test.js',
				've/test/dm/ve.dm.InternalList.test.js',
				've-mw/test/dm/ve.dm.InternalList.test.js',
				've/test/dm/ve.dm.Transaction.test.js',
				've/test/dm/ve.dm.TransactionProcessor.test.js',
				've/test/dm/ve.dm.Surface.test.js',
				've/test/dm/ve.dm.SurfaceFragment.test.js',
				've-mw/test/dm/ve.dm.SurfaceFragment.test.js',
				've/test/dm/ve.dm.ModelRegistry.test.js',
				've/test/dm/ve.dm.MetaList.test.js',
				've/test/dm/ve.dm.Model.test.js',
				've/test/dm/lineardata/ve.dm.ElementLinearData.test.js',
				've/test/dm/lineardata/ve.dm.MetaLinearData.test.js',
				've-mw/test/dm/ve.dm.mwExample.js',
				've-mw/test/dm/ve.dm.MWConverter.test.js',
				// VisualEditor ContentEditable Tests
				've/test/ce/ve.ce.test.js',
				've/test/ce/ve.ce.Document.test.js',
				've-mw/test/ce/ve.ce.Document.test.js',
				've/test/ce/ve.ce.NodeFactory.test.js',
				've/test/ce/ve.ce.Node.test.js',
				've/test/ce/ve.ce.BranchNode.test.js',
				've/test/ce/ve.ce.ContentBranchNode.test.js',
				've-mw/test/ce/ve.ce.ContentBranchNode.test.js',
				've/test/ce/ve.ce.LeafNode.test.js',
				've/test/ce/nodes/ve.ce.TextNode.test.js',
				// VisualEditor Actions Tests
				've/test/ui/actions/ve.ui.FormatAction.test.js',
				've-mw/test/ui/actions/ve.ui.FormatAction.test.js',
				've/test/ui/actions/ve.ui.IndentationAction.test.js',
				've/test/ui/actions/ve.ui.ListAction.test.js',
				// VisualEditor initialization Tests
				've/test/init/ve.init.Platform.test.js',
				've-mw/test/init/targets/ve.init.mw.ViewPageTarget.test.js',
			),
			'dependencies' => array(
				'unicodejs.wordbreak',
				'ext.visualEditor.standalone',
				'ext.visualEditor.core',
				'ext.visualEditor.experimental',
				'ext.visualEditor.viewPageTarget.init',
				'ext.visualEditor.viewPageTarget',
			),
			'localBasePath' => dirname( __FILE__ ) . '/modules',
			'remoteExtPath' => 'VisualEditor/modules',
		);

		return true;
	}


	/**
	 * Sets user preference to enable the VisualEditor account if their new
	 * account's userID is even, if $wgVisualEditorEnableSplitTest is true.
	 *
	 * Added per bug 49604; to be removed once no longer needed.
	 */
	public static function onAddNewAccount( $user, $byEmail ) {
		global $wgVisualEditorEnableSplitTest;

		if ( $wgVisualEditorEnableSplitTest &&
			$user->isLoggedin() &&
			( ( $user->getId() % 2 ) === 0 ) ) {
			$user->setOption( 'visualeditor-enable', 1 );
			$user->saveSettings();
		}

		return true;
	}
}
