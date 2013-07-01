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
			$wgVisualEditorEnableGenderSurvey;

		if ( $wgVisualEditorEnableEventLogging ) {
			if ( class_exists( 'ResourceLoaderSchemaModule' ) ) {
				// EventLogging schema module for logging edit events.
				// See <http://meta.wikimedia.org/wiki/Schema:Edit>
				$wgResourceModules['schema.Edit'] = array(
					'class'  => 'ResourceLoaderSchemaModule',
					'schema' => 'Edit',
					'revision' => 5570274,
				);

				if ( $wgVisualEditorEnableGenderSurvey ) {
					$wgResourceModules['schema.GenderSurvey'] = array(
						'class' => 'ResourceLoaderSchemaModule',
						'schema' => 'GenderSurvey',
						'revision' => 5607845,
					);
				}
			} else {
				wfWarn( 'VisualEditor is configured to use EventLogging, but the extension is ' .
						' not available. Disabling wgVisualEditorEnableEventLogging.' );
				$wgVisualEditorEnableEventLogging = false;
			}
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

		if (
			// Bug 50000: Allow disabling for anonymous users separately from changing
			// the default preference
			!( $wgVisualEditorDisableForAnons && $skin->getUser()->isAnon() ) &&

			// Bug 47328: Disable on redirect pages until redirects are editable
			!$skin->getTitle()->isRedirect() &&

			// User has the 'visualeditor-enable' preference set
			$skin->getUser()->getOption(
				'visualeditor-enable',
				/*default=*/ false,
				// HACK: Allows us to suppress the option in preferences when it's on for all.
				/*ignoreHidden=*/ true
			) &&

			// The user's current skin is supported
			in_array( $skin->getSkinName(), self::$supportedSkins ) &&

			(
				// Article in the VisualEditor namespace
				in_array( $skin->getTitle()->getNamespace(), $wgVisualEditorNamespaces ) ||
				// Special page action for an article in the VisualEditor namespace
				in_array( $skin->getRelevantTitle()->getNamespace(), $wgVisualEditorNamespaces )
			) &&

			// Only use VisualEditor if the page is wikitext, not CSS/JS
			$skin->getTitle()->getContentModel() === CONTENT_MODEL_WIKITEXT
		) {
			if ( $wgVisualEditorEnableEventLogging ) {
				$output->addModules( array( 'schema.Edit' ) );
			}
			$output->addModules( array( 'ext.visualEditor.viewPageTarget' ) );
		} else {
			if ( $wgVisualEditorEnableEventLogging ) {
				$output->addModules( array( 'schema.Edit', 'ext.visualEditor.splitTest' ) );
			}
		}
		return true;
	}

	// Temporary survey in conjuction with split test (bug 49604)
	// To be removed once no longer needed.
	// Depends on GuidedTour and EventLogging
	public static function onBeforeWelcomeCreation( &$welcomeCreationMsg, &$injectHtml ) {
		global $wgOut, $wgVisualEditorEnableGenderSurvey;

		if ( $wgVisualEditorEnableGenderSurvey ) {
			$wgOut->addModules( array(
				'ext.guidedTour.lib',
				'ext.guidedTour.tour.vegendersurvey',
				'ext.visualEditor.genderSurvey'
			) );
		}

		return true;
	}

	public static function onGetPreferences( $user, &$preferences ) {
		$preferences['visualeditor-enable'] = array(
			'type' => 'toggle',
			'label-message' => 'visualeditor-preference-enable',
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
			'pageLanguageCode' => $out->getTitle()->getPageLanguage()->getHtmlCode(),
			'pageLanguageDir' => $out->getTitle()->getPageLanguage()->getDir(),
			// Same as in Linker.php
			'magnifyClipIconURL' => $wgStylePath .
				'/common/images/magnify-clip' .
				( $wgContLang->isRTL() ? '-rtl' : '' ) . '.png'
		);

		return true;
	}

	/**
	 * Adds extra variables to the global config
	 */
	public static function onResourceLoaderGetConfigVars( array &$vars ) {
		global $wgVisualEditorEnableEventLogging,
			$wgVisualEditorEnableExperimentalCode, $wgVisualEditorTabLayout;

		$vars['wgVisualEditorConfig'] = array(
			'enableExperimentalCode' => $wgVisualEditorEnableExperimentalCode,
			'enableEventLogging' => $wgVisualEditorEnableEventLogging,
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
				// QUnit plugin
				've.qunit.js',
				// VisualEditor Tests
				've.test.js',
				've.Document.test.js',
				've.Element.test.js',
				've.Node.test.js',
				've.BranchNode.test.js',
				've.LeafNode.test.js',
				've.Factory.test.js',
				// VisualEditor DataModel Tests
				'dm/ve.dm.example.js',
				'dm/ve.dm.AnnotationSet.test.js',
				'dm/ve.dm.NodeFactory.test.js',
				'dm/ve.dm.Node.test.js',
				'dm/ve.dm.Converter.test.js',
				'dm/ve.dm.BranchNode.test.js',
				'dm/ve.dm.LeafNode.test.js',
				'dm/ve.dm.LinearData.test.js',
				'dm/nodes/ve.dm.TextNode.test.js',
				'dm/nodes/ve.dm.MWTransclusionNode.test.js',
				'dm/ve.dm.Document.test.js',
				'dm/ve.dm.DocumentSynchronizer.test.js',
				'dm/ve.dm.IndexValueStore.test.js',
				'dm/ve.dm.InternalList.test.js',
				'dm/ve.dm.Transaction.test.js',
				'dm/ve.dm.TransactionProcessor.test.js',
				'dm/ve.dm.Surface.test.js',
				'dm/ve.dm.SurfaceFragment.test.js',
				'dm/ve.dm.ModelRegistry.test.js',
				'dm/ve.dm.MetaList.test.js',
				'dm/ve.dm.Model.test.js',
				'dm/lineardata/ve.dm.ElementLinearData.test.js',
				'dm/lineardata/ve.dm.MetaLinearData.test.js',
				'dm/ve.dm.mwExample.js',
				'dm/ve.dm.MWConverter.test.js',
				// VisualEditor ContentEditable Tests
				'ce/ve.ce.test.js',
				'ce/ve.ce.Document.test.js',
				'ce/ve.ce.NodeFactory.test.js',
				'ce/ve.ce.Node.test.js',
				'ce/ve.ce.BranchNode.test.js',
				'ce/ve.ce.ContentBranchNode.test.js',
				'ce/ve.ce.LeafNode.test.js',
				'ce/nodes/ve.ce.TextNode.test.js',
				// VisualEditor Actions Tests
				'ui/actions/ve.ui.FormatAction.test.js',
				'ui/actions/ve.ui.IndentationAction.test.js',
				'ui/actions/ve.ui.ListAction.test.js',
				// VisualEditor initialization Tests
				'init/ve.init.Platform.test.js',
				'init/mw/targets/ve.init.mw.ViewPageTarget.test.js',
			),
			'dependencies' => array(
				'ext.visualEditor.standalone',
				'ext.visualEditor.core',
				'ext.visualEditor.experimental',
				'ext.visualEditor.viewPageTarget',
			),
			'localBasePath' => dirname( __FILE__ ) . '/modules/ve/test',
			'remoteExtPath' => 'VisualEditor/modules/ve/test',
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
