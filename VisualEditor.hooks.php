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
	public static function onSetup() {
		global $wgResourceModules, $wgVisualEditorResourceTemplate,
			$wgVisualEditorTabMessages;

		// This prevents VisualEditor from being run in environments that don't
		// have the dependent code in core; this should be updated as a part of
		// when additional dependencies are created and pushed into MediaWiki's
		// core. The most direct effect of this is to avoid confusing any third
		// parties who attempt to install VisualEditor onto non-alpha wikis, as
		// this should have no impact on deploying to Wikimedia's wiki cluster.
		// Is fine for release tarballs because 1.22wmf11 < 1.22alpha < 1.22.0.
		wfUseMW( '1.23wmf2' );

		// Add tab messages to the init init module
		foreach ( $wgVisualEditorTabMessages as $msg ) {
			if ( $msg !== null ) {
				$wgResourceModules['ext.visualEditor.viewPageTarget.init']['messages'][] = $msg;
			}
		}
	}

	/**
	 * Adds VisualEditor JS to the output.
	 *
	 * This is attached to the MediaWiki 'BeforePageDisplay' hook.
	 *
	 * @param $output OutputPage
	 * @param $skin Skin
	 */
	public static function onBeforePageDisplay( &$output, &$skin ) {
		$output->addModules( array( 'ext.visualEditor.viewPageTarget.init' ) );
		$output->addModuleStyles( array( 'ext.visualEditor.viewPageTarget.noscript' ) );
		return true;
	}

	/**
	 * Changes the Edit tab and adds the VisualEditor tab.
	 *
	 * This is attached to the MediaWiki 'SkinTemplateNavigation' hook.
	 *
	 * @param SkinTemplate $skin
	 * @param array $links Navigation links
	 * @return boolean
	 */
	public static function onSkinTemplateNavigation( &$skin, &$links ) {
		// Only do this if the user has VE enabled
		if (
			!$skin->getUser()->getOption( 'visualeditor-enable' ) ||
			$skin->getUser()->getOption( 'visualeditor-betatempdisable' )
		) {
			return true;
		}

		global $wgVisualEditorTabMessages, $wgVisualEditorTabPosition;
		if ( !isset( $links['views']['edit'] ) ) {
			// There's no edit link, nothing to do
			return true;
		}
		$title = $skin->getRelevantTitle();
		// Rebuild the $links['views'] array and inject the VisualEditor tab before or after
		// the edit tab as appropriate. We have to rebuild the array because PHP doesn't allow
		// us to splice into the middle of an associative array.
		$newViews = array();
		foreach ( $links['views'] as $action => $data ) {
			if ( $action === 'edit' ) {
				// Build the VisualEditor tab
				$existing = $title->exists() || (
					$title->getNamespace() == NS_MEDIAWIKI &&
					$title->getDefaultMessageText() !== false
				);
				$veParams = $skin->editUrlOptions();
				unset( $veParams['action'] ); // Remove action=edit
				$veParams['veaction'] = 'edit'; // Set veaction=edit
				$veTabMessage = $wgVisualEditorTabMessages[$existing ? 'edit' : 'create'];
				$veTabText = $veTabMessage === null ? $data['text'] :
					wfMessage( $veTabMessage )->setContext( $skin->getContext() )->text();
				$veTab = array(
					'href' => $title->getLocalURL( $veParams ),
					'text' => $veTabText,
					'primary' => true,
					'class' => '',
				);

				// Alter the edit tab
				$editTab = $data;
				$editTabMessage = $wgVisualEditorTabMessages[$existing ? 'editsource' : 'createsource'];
				if ( $editTabMessage !== null ) {
					$editTab['text'] = wfMessage( $editTabMessage )->setContext( $skin->getContext() )->text();
				}

				// Inject the VE tab before or after the edit tab
				if ( $wgVisualEditorTabPosition === 'before' ) {
					$newViews['ve-edit'] = $veTab;
					$newViews['edit'] = $editTab;
				} else {
					$newViews['edit'] = $editTab;
					$newViews['ve-edit'] = $veTab;
				}
			} else {
				// Just pass through
				$newViews[$action] = $data;
			}
		}
		$links['views'] = $newViews;
		return true;
	}

	/**
	 * Changes the section edit links to add a VE edit link.
	 *
	 * This is attached to the MediaWiki 'DoEditSectionLink' hook.
	 *
	 * @param $skin Skin
	 * @param $title Title
	 * @param $section string
	 * @param $tooltip string
	 * @param $result string HTML
	 * @param $lang Language
	 * @returns bool true
	 */
	public static function onDoEditSectionLink( $skin, $title, $section, $tooltip, &$result, $lang ) {
		// Only do this if the user has VE enabled
		// (and we're not in parserTests)
		if (
			isset( $GLOBALS[ 'wgVisualEditorInParserTests' ] ) ||
			!$skin->getUser()->getOption( 'visualeditor-enable' ) ||
			$skin->getUser()->getOption( 'visualeditor-betatempdisable' )
		) {
			return;
		}

		global $wgVisualEditorTabMessages, $wgVisualEditorTabPosition;
		$veEditSection = $wgVisualEditorTabMessages['editsection'] !== null ?
			$wgVisualEditorTabMessages['editsection'] : 'editsection';
		$sourceEditSection = $wgVisualEditorTabMessages['editsectionsource'] !== null ?
			$wgVisualEditorTabMessages['editsectionsource'] : 'editsection';

		// Code mostly duplicated from Skin::doEditSectionLink() :(
		$attribs = array();
		if ( !is_null( $tooltip ) ) {
			# Bug 25462: undo double-escaping.
			$tooltip = Sanitizer::decodeCharReferences( $tooltip );
			$attribs['title'] = wfMessage( 'editsectionhint' )->rawParams( $tooltip )
				->inLanguage( $lang )->text();
		}
		$veLink = Linker::link( $title, wfMessage( $veEditSection )->inLanguage( $lang )->text(),
			$attribs + array( 'class' => 'mw-editsection-visualeditor' ),
			array( 'veaction' => 'edit', 'section' => $section ),
			array( 'noclasses', 'known' )
		);
		$sourceLink = Linker::link( $title, wfMessage( $sourceEditSection )->inLanguage( $lang )->text(),
			$attribs,
			array( 'action' => 'edit', 'section' => $section ),
			array( 'noclasses', 'known' )
		);

		$veFirst = $wgVisualEditorTabPosition === 'before';
		$result = '<span class="mw-editsection">'
			. '<span class="mw-editsection-bracket">[</span>'
			. ( $veFirst ? $veLink : $sourceLink )
			. '<span class="mw-editsection-divider">'
			. wfMessage( 'pipe-separator' )->inLanguage( $lang )->text()
			. '</span>'
			. ( $veFirst ? $sourceLink : $veLink )
			. '<span class="mw-editsection-bracket">]</span>'
			. '</span>';

		return true;
	}

	public static function onGetPreferences( $user, &$preferences ) {
		if ( !array_key_exists( 'visualeditor-enable', $preferences ) ) {
			$preferences['visualeditor-enable'] = array(
				'type' => 'toggle',
				'label-message' => 'visualeditor-preference-enable',
				'section' => 'editing/beta'
			);
		}
		$preferences['visualeditor-betatempdisable'] = array(
			'type' => 'toggle',
			'label-message' => 'visualeditor-preference-betatempdisable',
			'section' => 'editing/beta'
		);
		return true;
	}

	public static function onGetBetaPreferences( $user, &$preferences ) {
		global $wgExtensionAssetsPath, $wgVisualEditorSupportedSkins, $wgVisualEditorBrowserBlacklist;

		$dir = RequestContext::getMain()->getLanguage()->getDir();

		$preferences['visualeditor-enable'] = array(
			'version' => '1.0',
			'label-message' => 'visualeditor-preference-core-label',
			'desc-message' => 'visualeditor-preference-core-description',
			'screenshot' => $wgExtensionAssetsPath .
				"/VisualEditor/betafeatures-icon-VisualEditor-$dir.svg",
			'info-message' => 'visualeditor-preference-core-info-link',
			'discussion-message' => 'visualeditor-preference-core-discussion-link',
			'requirements' => array(
				'javascript' => true,
				'blacklist' => $wgVisualEditorBrowserBlacklist,
				'skins' => $wgVisualEditorSupportedSkins,
			)
		);

/* Disabling Beta Features option for language for now
		$preferences['visualeditor-enable-language'] = array(
			'version' => '1.0',
			'label-message' => 'visualeditor-preference-language-label',
			'desc-message' => 'visualeditor-preference-language-description',
			'screenshot' => $wgExtensionAssetsPath .
				"/VisualEditor/betafeatures-icon-VisualEditor-language-$dir.svg",
			'info-message' => 'visualeditor-preference-experimental-info-link',
			'discussion-message' => 'visualeditor-preference-experimental-discussion-link',
			'requirements' => array(
				'betafeatures' => array(
					'visualeditor-enable',
				),
			),
		);
*/

/* Disabling Beta Features option for generic content for now
		$preferences['visualeditor-enable-mwalienextension'] = array(
			'version' => '1.0',
			'label-message' => 'visualeditor-preference-mwalienextension-label',
			'desc-message' => 'visualeditor-preference-mwalienextension-description',
			'screenshot' => $wgExtensionAssetsPath .
				"/VisualEditor/betafeatures-icon-VisualEditor-alien-$dir.svg",
			'info-message' => 'visualeditor-preference-mwalienextension-info-link',
			'discussion-message' => 'visualeditor-preference-mwalienextension-discussion-link',
			'requirements' => array(
				'betafeatures' => array(
					'visualeditor-enable',
				),
			),
		);
*/

		$preferences['visualeditor-enable-mwmath'] = array(
			'version' => '1.0',
			'label-message' => 'visualeditor-preference-mwmath-label',
			'desc-message' => 'visualeditor-preference-mwmath-description',
			'screenshot' => $wgExtensionAssetsPath .
				"/VisualEditor/betafeatures-icon-VisualEditor-formulae-$dir.svg",
			'info-message' => 'visualeditor-preference-mwmath-info-link',
			'discussion-message' => 'visualeditor-preference-mwmath-discussion-link',
			'requirements' => array(
				'betafeatures' => array(
					'visualeditor-enable',
				),
			),
		);

/* Disabling Beta Features option for hieroglyphics for now
		$preferences['visualeditor-enable-mwhiero'] = array(
			'version' => '1.0',
			'label-message' => 'visualeditor-preference-mwhiero-label',
			'desc-message' => 'visualeditor-preference-mwhiero-description',
			'screenshot' => $wgExtensionAssetsPath .
				"/VisualEditor/betafeatures-icon-VisualEditor-hieroglyphics-$dir.svg",
			'info-message' => 'visualeditor-preference-mwhiero-info-link',
			'discussion-message' => 'visualeditor-preference-mwhiero-discussion-link',
			'requirements' => array(
				'betafeatures' => array(
					'visualeditor-enable',
				),
			),
		);
*/

/* Disabling Beta Features option for syntax highlighting for now
		$preferences['visualeditor-enable-mwsyntaxHighlight'] = array(
			'version' => '1.0',
			'label-message' => 'visualeditor-preference-mwsyntaxHighlight-label',
			'desc-message' => 'visualeditor-preference-mwsyntaxHighlight-description',
			'screenshot' => $wgExtensionAssetsPath .
				"/VisualEditor/betafeatures-icon-VisualEditor-syntaxHighlight-$dir.svg",
			'info-message' => 'visualeditor-preference-mwsyntaxHighlight-info-link',
			'discussion-message' => 'visualeditor-preference-mwsyntaxHighlight-discussion-link',
			'requirements' => array(
				'betafeatures' => array(
					'visualeditor-enable',
				),
			),
		);
*/
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
		global $wgStylePath;

		$pageLanguage = $out->getTitle()->getPageLanguage();

		$vars['wgVisualEditor'] = array(
			'isPageWatched' => $out->getUser()->isWatched( $out->getTitle() ),
			// Same as in Linker.php
			'magnifyClipIconURL' => $wgStylePath .
				'/common/images/magnify-clip' .
				( $pageLanguage->isRTL() ? '-rtl' : '' ) . '.png',
			'pageLanguageCode' => $pageLanguage->getHtmlCode(),
			'pageLanguageDir' => $pageLanguage->getDir()
		);

		return true;
	}

	/**
	 * Adds extra variables to the global config
	 */
	public static function onResourceLoaderGetConfigVars( array &$vars ) {
		global $wgDefaultUserOptions,
			$wgVisualEditorDisableForAnons,
			$wgVisualEditorEnableExperimentalCode,
			$wgVisualEditorNamespaces,
			$wgVisualEditorPluginModules,
			$wgVisualEditorTabPosition,
			$wgVisualEditorTabMessages,
			$wgVisualEditorBrowserBlacklist,
			$wgVisualEditorSupportedSkins,
			$wgVisualEditorShowBetaWelcome;

		$vars['wgVisualEditorConfig'] = array(
			'disableForAnons' => $wgVisualEditorDisableForAnons,
			'enableExperimentalCode' => $wgVisualEditorEnableExperimentalCode,
			'namespaces' => $wgVisualEditorNamespaces,
			'pluginModules' => $wgVisualEditorPluginModules,
			'defaultUserOptions' => array(
				'betatempdisable' => $wgDefaultUserOptions['visualeditor-betatempdisable'],
				'enable' => $wgDefaultUserOptions['visualeditor-enable'],
				'enable-experimental' => $wgDefaultUserOptions['visualeditor-enable-experimental'],
//				'enable-language' => $wgDefaultUserOptions['visualeditor-enable-language'],
//				'enable-mwalienextension' => $wgDefaultUserOptions['visualeditor-enable-mwalienextension'],
				'enable-mwmath' => $wgDefaultUserOptions['visualeditor-enable-mwmath'],
//				'enable-mwhiero' => $wgDefaultUserOptions['visualeditor-enable-mwhiero'],
//				'enable-mwsyntaxHighlight' => $wgDefaultUserOptions['visualeditor-enable-mwsyntaxHighlight'],
			),
			'blacklist' => $wgVisualEditorBrowserBlacklist,
			'skins' => $wgVisualEditorSupportedSkins,
			'tabPosition' => $wgVisualEditorTabPosition,
			'tabMessages' => $wgVisualEditorTabMessages,
			'showBetaWelcome' => $wgVisualEditorShowBetaWelcome,
		);

		return true;
	}

	/**
	 * Conditionally register the oojs and oojs-ui modules, in case they've already been registered
	 * by a more recent version of MediaWiki core.
	 *
	 * Also conditionally register the jquery.uls and jquery.i18n modules, in case they've already
	 * been registered by the UniversalLanguageSelector extension.
	 *
	 * @param ResourceLoader $resourceLoader
	 * @returns boolean true
	 */
	public static function onResourceLoaderRegisterModules( ResourceLoader &$resourceLoader ) {
		global $wgResourceModules, $wgVisualEditorResourceTemplate;
		$modules = array();
		if ( !isset( $wgResourceModules['oojs'] ) && !$resourceLoader->getModule( 'oojs' ) ) {
			$modules['oojs'] = $wgVisualEditorResourceTemplate + array(
				'scripts' => array(
					'oojs/oojs.js',
				),
				'targets' => array( 'desktop', 'mobile' ),
			);
		}

		if ( !isset( $wgResourceModules['oojs-ui'] ) && !$resourceLoader->getModule( 'oojs-ui' ) ) {
			$modules['oojs-ui'] = $wgVisualEditorResourceTemplate + array(
				'scripts' => array(
					'oojs-ui/oojs-ui.js',
				),
				'styles' => array(
					'oojs-ui/oojs-ui.svg.css',
				),
				'messages' => array(
					'ooui-dialog-action-close',
					'ooui-outline-control-move-down',
					'ooui-outline-control-move-up',
					'ooui-toggle-on',
					'ooui-toggle-off',
					'ooui-toolbar-more',
				),
				'dependencies' => array(
					'oojs'
				),
				'targets' => array( 'desktop', 'mobile' ),
			);
		}

		if ( !isset( $wgResourceModules['jquery.uls'] ) && !$resourceLoader->getModule( 'jquery.uls' ) ) {
			$modules['jquery.uls'] = $wgVisualEditorResourceTemplate + array(
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
		}

		if (
			!isset( $wgResourceModules['jquery.uls.data'] ) &&
			!$resourceLoader->getModule( 'jquery.uls.data' )
		) {
			$modules['jquery.uls.data'] = $wgVisualEditorResourceTemplate + array(
				'scripts' => array(
					'jquery.uls/src/jquery.uls.data.js',
					'jquery.uls/src/jquery.uls.data.utils.js',
				),
				'position' => 'top',
			);
		}

		if (
			!isset( $wgResourceModules['jquery.uls.grid'] ) &&
			!$resourceLoader->getModule( 'jquery.uls.grid' )
		) {
			$modules['jquery.uls.grid'] = $wgVisualEditorResourceTemplate + array(
				'styles' => 'jquery.uls/css/jquery.uls.grid.css',
				'position' => 'top',
			);
		}

		if (
			!isset( $wgResourceModules['jquery.uls.compact'] ) &&
			!$resourceLoader->getModule( 'jquery.uls.compact' )
		) {
			$modules['jquery.uls.compact'] = $wgVisualEditorResourceTemplate + array(
				'styles' => 'jquery.uls/css/jquery.uls.compact.css',
				'position' => 'top',
			);
		}

		if (
			!isset( $wgResourceModules['jquery.i18n'] ) &&
			!$resourceLoader->getModule( 'jquery.i18n' )
		) {
			$modules['jquery.i18n'] = $wgVisualEditorResourceTemplate + array(
				'scripts' => array(
					'jquery.i18n/src/jquery.i18n.js',
					'jquery.i18n/src/jquery.i18n.messagestore.js',
					'jquery.i18n/src/jquery.i18n.parser.js',
					'jquery.i18n/src/jquery.i18n.emitter.js',
					'jquery.i18n/src/jquery.i18n.language.js',
				),
				'dependencies' => 'mediawiki.libs.pluralruleparser',
				'languageScripts' => array(
					'bs' => 'jquery.i18n/src/languages/bs.js',
					'dsb' => 'jquery.i18n/src/languages/dsb.js',
					'fi' => 'jquery.i18n/src/languages/fi.js',
					'ga' => 'jquery.i18n/src/languages/ga.js',
					'he' => 'jquery.i18n/src/languages/he.js',
					'hsb' => 'jquery.i18n/src/languages/hsb.js',
					'hu' => 'jquery.i18n/src/languages/hu.js',
					'hy' => 'jquery.i18n/src/languages/hy.js',
					'la' => 'jquery.i18n/src/languages/la.js',
					'ml' => 'jquery.i18n/src/languages/ml.js',
					'os' => 'jquery.i18n/src/languages/os.js',
					'ru' => 'jquery.i18n/src/languages/ru.js',
					'sl' => 'jquery.i18n/src/languages/sl.js',
					'uk' => 'jquery.i18n/src/languages/uk.js',
				),
			);
		}

		$resourceLoader->register( $modules );
		return true;
	}

	public static function onResourceLoaderTestModules(
		array &$testModules,
		ResourceLoader &$resourceLoader
	) {
		$testModules['qunit']['ext.visualEditor.test'] = array(
			'styles' => array(
				// jsdifflib
				'jsdifflib/diffview.css',
			),
			'scripts' => array(
				// MW config preload
				've-mw/test/mw-preload.js',
				// jsdifflib
				'jsdifflib/diffview.js',
				'jsdifflib/difflib.js',
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
				've/test/ve.Node.test.js',
				've/test/ve.BranchNode.test.js',
				've/test/ve.LeafNode.test.js',
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
				've-mw/test/dm/ve.dm.Transaction.test.js',
				've/test/dm/ve.dm.TransactionProcessor.test.js',
				've/test/dm/ve.dm.Surface.test.js',
				've/test/dm/ve.dm.SurfaceFragment.test.js',
				've-mw/test/dm/ve.dm.SurfaceFragment.test.js',
				've/test/dm/ve.dm.ModelRegistry.test.js',
				've/test/dm/ve.dm.MetaList.test.js',
				've/test/dm/ve.dm.Model.test.js',
				've/test/dm/lineardata/ve.dm.FlatLinearData.test.js',
				've/test/dm/lineardata/ve.dm.ElementLinearData.test.js',
				've/test/dm/lineardata/ve.dm.MetaLinearData.test.js',
				've-mw/test/dm/ve.dm.mwExample.js',
				've-mw/test/dm/ve.dm.MWConverter.test.js',
				// VisualEditor ContentEditable Tests
				've/test/ce/ve.ce.test.js',
				've/test/ce/ve.ce.Document.test.js',
				've/test/ce/ve.ce.Surface.test.js',
				've-mw/test/ce/ve.ce.Document.test.js',
				've-mw/test/ce/ve.ce.Surface.test.js',
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
				// IME tests
				've/test/ce/ve.ce.TestRunner.js',
				've/test/ce/ve.ce.imetests.test.js',
				've/test/ce/imetests/backspace-chromium-ubuntu-none.js',
				've/test/ce/imetests/backspace-firefox-ubuntu-none.js',
				've/test/ce/imetests/backspace-ie-win-none.js',
				've/test/ce/imetests/input-chrome-win-chinese-traditional-handwriting.js',
				've/test/ce/imetests/input-chrome-win-greek.js',
				've/test/ce/imetests/input-chrome-win-welsh.js',
				've/test/ce/imetests/input-chromium-ubuntu-ibus-chinese-cantonese.js',
				've/test/ce/imetests/input-chromium-ubuntu-ibus-japanese-anthy--hiraganaonly.js',
				've/test/ce/imetests/input-chromium-ubuntu-ibus-korean-korean.js',
				've/test/ce/imetests/input-chromium-ubuntu-ibus-malayalam-swanalekha.js',
				've/test/ce/imetests/input-firefox-ubuntu-ibus-chinese-cantonese.js',
				've/test/ce/imetests/input-firefox-ubuntu-ibus-japanese-anthy--hiraganaonly.js',
				've/test/ce/imetests/input-firefox-ubuntu-ibus-korean-korean.js',
				've/test/ce/imetests/input-firefox-ubuntu-ibus-malayalam.swanalekha.js',
				've/test/ce/imetests/input-firefox-win-chinese-traditional-handwriting.js',
				've/test/ce/imetests/input-firefox-win-greek.js',
				've/test/ce/imetests/input-firefox-win-welsh.js',
				've/test/ce/imetests/input-ie-win-chinese-traditional-handwriting.js',
				've/test/ce/imetests/input-ie-win-greek.js',
				've/test/ce/imetests/input-ie-win-korean.js',
				've/test/ce/imetests/input-ie-win-welsh.js',
				've/test/ce/imetests/leftarrow-chromium-ubuntu-none.js',
				've/test/ce/imetests/leftarrow-firefox-ubuntu-none.js',
				've/test/ce/imetests/leftarrow-ie-win-none.js',
			),
			'dependencies' => array(
				'unicodejs.wordbreak',
				'ext.visualEditor.standalone',
				'ext.visualEditor.core',
				'ext.visualEditor.experimental',
				'ext.visualEditor.viewPageTarget.init',
				'ext.visualEditor.viewPageTarget',
			),
			'localBasePath' => __DIR__ . '/modules',
			'remoteExtPath' => 'VisualEditor/modules',
		);

		return true;
	}

	/**
	 * Ensures that we know whether we're running inside a parser test.
	 */
	public static function onParserTestGlobals( array &$settings ) {
		$settings['wgVisualEditorInParserTests'] = true;
	}
}
