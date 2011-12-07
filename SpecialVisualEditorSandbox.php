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
		<div id="es-modes" class="es-modes">
			<div id="es-mode-wikitext" class="es-modes-button"></div>
			<div id="es-mode-json" class="es-modes-button"></div>
			<div id="es-mode-html" class="es-modes-button"></div>
			<div id="es-mode-render" class="es-modes-button"></div>
			<div id="es-mode-history" class="es-modes-button"></div>
		</div>
		<div style="clear:both"></div>
		<div id="es-toolbar-shadow"></div>
	</div>
	<div id="es-panes">
		<div id="es-visual">
			<div id="es-editor"></div>
		</div>
		<div id="es-panels">
			<div id="es-panel-wikitext" class="es-panel es-code"></div>
			<div id="es-panel-json" class="es-panel es-code"></div>
			<div id="es-panel-html" class="es-panel es-code"></div>
			<div id="es-panel-render" class="es-panel es-render"></div>
			<div id="es-panel-history" class="es-panel es-code"></div>
		</div>
		<div style="clear:both"></div>
	</div>
</div>
<!-- /VisualEditor Sandbox -->
HTML;

		$wgOut->addHtml( $out );
	}
}
