<?php
/* Base parsoid API wrapper. */
class ApiVisualEditor extends ApiBase {

	public function execute() {
		global $wgRequest;

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
			$c = curl_init( $parsoid.$page );
			curl_setopt($c, CURLOPT_POST, 1);
			curl_setopt($c, CURLOPT_POSTFIELDS, 'content='.$params['html']);
			curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
			$wikitext = curl_exec($c);
			curl_close($c);

			if ( $wikitext ) {
				// Prepare api request to save the page
				$apiParams = array(
					'action' => 'edit',
					'title' => $page,
					'text' => $wikitext,
					'token' => $params['token'],
					'summary' => $params['summary'],
					'notminor' => true
				);

				$api = new ApiMain(
					new DerivativeRequest(
						$wgRequest,
						$apiParams,
						false // was posted?
					),
					true // enable write?
				);
				//save
				$api->execute();

				// Prepare api request to get new content
				$apiParams = array(
					'action' => 'parse',
					'page' => $page
				);
				$api = new ApiMain(
					new DerivativeRequest(
						$wgRequest,
						$apiParams,
						false // was posted?
					),
					true // enable write?
				);
				$api->execute();
				$result = $api->getResultData();
		
				$result = array(
					'result' => 'success',
					'content' => $result['parse']['text']['*']
				);
			} else {
				$result = array(
					'result' => 'error'
				);
			}

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
			),
			'summary' => null,
			'token' => null
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
