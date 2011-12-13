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

		$wgOut->addModules( 'ext.visualEditor.special.sandbox' );
		$this->setHeaders();
		$wgOut->setPageTitle( wfMsg( 'visualeditor-sandbox-title' )  );
		$modeWikitext = wfMsgHtml( 'visualeditor-tooltip-wikitext' );
		$modeJson = wfMsgHtml( 'visualeditor-tooltip-json' );
		$modeHtml = wfMsgHtml( 'visualeditor-tooltip-html' );
		$modeRender = wfMsgHtml( 'visualeditor-tooltip-render' );
		$modeHistory = wfMsgHtml( 'visualeditor-tooltip-history' );
		$modeHelp = wfMsgHtml( 'visualeditor-tooltip-help' );

		$feedbackPrompt = wfMsgHtml( 'visualeditor-feedback-prompt' );
		$feedbackDialogTitle = wfMsgHtml( 'visualeditor-feedback-dialog-title' );

		$out = <<<HTML
<!-- VisualEditor Sandbox -->
<div id="es-docs">
	<div id="es-docs-label">Example documents:</div>
	<ul id="es-docs-list" ></ul>
</div>
<div id="es-base">
	<div id="es-toolbar-wrapper">
		<div id="es-toolbar" class="es-toolbar">
			<div id="es-modes" class="es-modes">
				<div id="es-mode-wikitext" class="es-modes-button" title="$modeWikitext"></div>
				<div id="es-mode-json" class="es-modes-button" title="$modeJson"></div>
				<div id="es-mode-html" class="es-modes-button" title="$modeHtml"></div>
				<div id="es-mode-render" class="es-modes-button" title="$modeRender"></div>
				<div id="es-mode-history" class="es-modes-button" title="$modeHistory"></div>
				<div id="es-mode-help" class="es-modes-button" title="$modeHelp"></div>
			</div>
			<div style="clear:both"></div>
			<div id="es-toolbar-shadow"></div>
		</div>
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
			<div id="es-panel-help" class="es-panel">
				<div class="es-help-title">Keyboard Shortcuts</div>
				<div class="es-help-shortcuts-title">Clipboard</div>
				<div class="es-help-shortcut">
					<span class="es-help-keys">
						<span class="es-help-key">Ctl <span class="es-help-key-or">or</span> &#8984;</span> +
						<span class="es-help-key">C</span>
					</span>
					Copy selected text
				</div>
				<div class="es-help-shortcut">
					<span class="es-help-keys">
						<span class="es-help-key">Ctl <span class="es-help-key-or">or</span> &#8984;</span> +
						<span class="es-help-key">X</span>
					</span>
					Cut selected text
				</div>
				<div class="es-help-shortcut">
					<span class="es-help-keys">
						<span class="es-help-key">Ctl <span class="es-help-key-or">or</span> &#8984;</span> +
						<span class="es-help-key">V</span>
					</span>
					Paste text at the cursor
				</div>
				<div class="es-help-shortcuts-title">History navigation</div>
				<div class="es-help-shortcut">
					<span class="es-help-keys">
						<span class="es-help-key">Ctl <span class="es-help-key-or">or</span> &#8984;</span> +
						<span class="es-help-key">Z</span>
					</span>
					Undo
				</div>
				<div class="es-help-shortcut">
					<span class="es-help-keys">
						<span class="es-help-key">Ctl <span class="es-help-key-or">or</span> &#8984;</span> +
						<span class="es-help-key">Y</span>
					</span>
					Redo
				</div>
				<div class="es-help-shortcut">
					<span class="es-help-keys">
						<span class="es-help-key">Ctl <span class="es-help-key-or">or</span> &#8984;</span> +
						<span class="es-help-key">&#8679;</span> +
						<span class="es-help-key">Z</span>
					</span>
					Redo
				</div>
				<div class="es-help-shortcuts-title">Formatting</div>
				<div class="es-help-shortcut">
					<span class="es-help-keys">
						<span class="es-help-key">Ctl <span class="es-help-key-or">or</span> &#8984;</span> +
						<span class="es-help-key">B</span>
					</span>
					Make selected text bold
				</div>
				<div class="es-help-shortcut">
					<span class="es-help-keys">
						<span class="es-help-key">Ctl <span class="es-help-key-or">or</span> &#8984;</span> +
						<span class="es-help-key">I</span>
					</span>
					Make selected text italic
				</div>
				<div class="es-help-shortcut">
					<span class="es-help-keys">
						<span class="es-help-key">Ctl <span class="es-help-key-or">or</span> &#8984;</span> +
						<span class="es-help-key">K</span>
					</span>
					Make selected text a link
				</div>
				<div class="es-help-shortcuts-title">Selection</div>
				<div class="es-help-shortcut">
					<span class="es-help-keys">
						<span class="es-help-key">&#8679;</span> +
						<span class="es-help-key">Arrow</span>
					</span>
					Adjust selection
				</div>
				<div class="es-help-shortcut">
					<span class="es-help-keys">
						<span class="es-help-key">Alt</span> +
						<span class="es-help-key">Arrow</span>
					</span>
					Move cursor by words or blocks
				</div>
				<div class="es-help-shortcut">
					<span class="es-help-keys">
						<span class="es-help-key">Alt</span> +
						<span class="es-help-key">&#8679;</span> +
						<span class="es-help-key">Arrow</span>
					</span>
					Adjust selection by words or blocks
				</div>
			</div>
		</div>
		<div style="clear:both"></div>
	</div>
</div>
<!-- /VisualEditor Sandbox -->
HTML;

		$wgOut->addHtml( $out );
	}
}
