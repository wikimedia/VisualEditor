<?php
/**
 * Sandbox SpecialPage for VisualEditor extension
 * 
 * @file
 * @ingroup Extensions
 */

class SpecialVisualEditorSandbox extends SpecialPage {

	/* Methods */

	public function __construct() {
		parent::__construct( 'VisualEditorSandbox' );
	}

	public function execute( $par ) {
		global $wgOut;

		$wgOut->addModules( 'ext.visualEditor.sandbox' );
		$this->setHeaders();
		$wgOut->setPageTitle( wfMsg( 'visualeditor-sandbox-title' )  );

		$out = <<<HTML
<!-- VisualEditor Sandbox -->
<div id="es-base">
	<div id="es-toolbar" class="es-toolbar">
		<div style="clear:both"></div>
		<div id="es-toolbar-shadow"></div>
	</div>
	<div id="es-panes">
		<div id="es-visual">
			<div id="es-editor"></div>
		</div>
		<div id="es-previews">
			<div id="es-preview-wikitext" class="es-preview es-code"></div>
			<div id="es-preview-json" class="es-preview es-code"></div>
			<div id="es-preview-html" class="es-preview es-code"></div>
			<div id="es-preview-render" class="es-preview es-render"></div>
			<div id="es-preview-history" class="es-preview es-history"></div>
		</div>
		<div style="clear:both"></div>
	</div>
</div>
<!-- /VisualEditor Sandbox -->
HTML;

		$wgOut->addHtml( $out );
	}
}
