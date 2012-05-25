<?php
/* Base parsoid API wrapper. */
class ApiVisualEditor extends ApiBase {
	public function execute() {
		$parsoid = "http://parsoid.wmflabs.org/";
		$params = $this->extractRequestParams();
		$page = Title::newFromText( $params['page'] );

		if ($params['paction'] === 'parse') {

			// Not reliable for long request.
			$parsed = file_get_contents(
				$parsoid.$page
			);

			if ( $parsed ) {
				$result = array(
					'result' => 'success',
					'parsed' => $parsed
				);
			} else {
				$result = array(
					'result' => 'error'
				);
			}
		} elseif ($params['paction'] === 'save') {
			// API Posts HTML to Parsoid Service, receives Wikitext,
			// API Saves Wikitext to page.
		}

		$this->getResult()->addValue( null, $this->getModuleName(), $result );
	}

	public function getAllowedParams() {
		return array(
			'page' => array(
				ApiBase::PARAM_REQUIRED => true,
			),
			'paction' => array(
				ApiBase::PARAM_REQUIRED => true,
			),
			'html' => array(
				ApiBase::PARAM_REQUIRED => false,
			)
		);
	}

	public function needsToken() {
		return true;
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}

	public function getParamDescription() {
		return array(
			'page' => 'The page to get content for',
			'paction' => 'Parsoid action.  Only parse or save',
			'html' => 'HTML to send to parsoid in exchange for wikitext'
		);
	}

	public function getDescription() {
		return 'Returns HTML5 for a page from the parsoid service.';
	}
}
