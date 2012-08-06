<?php
/**
 * Parsoid API wrapper.
 *
 * @file
 * @ingroup Extensions
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

class ApiVisualEditor extends ApiBase {

	public function execute() {
		global $wgVisualEditorParsoidURL;
		$user = $this->getUser();

		$parsoid = $wgVisualEditorParsoidURL;
		$params = $this->extractRequestParams();
		$page = Title::newFromText( $params['page'] );

		if ( $params['paction'] === 'parse' ) {
			if ( $page->exists() ) {
				$parsed = Http::get(
					// Insert slash since wgVisualEditorParsoidURL may or may not
					// end in a slash. Double slashes are no problem --catrope
					$parsoid . '/' . $page->getPrefixedDBkey()
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
			} else {
				$result = array(
					'result' => 'success',
					'parsed' => ''
				);
			}
		} elseif ( $params['paction'] === 'save' && $user->isBlocked() ) {
			$result = array( 'result' => 'error' );
		} elseif ( $params['paction'] === 'save' /* means user is not blocked */ ) {
			// API Posts HTML to Parsoid Service, receives Wikitext,
			// API Saves Wikitext to page.
			$wikitext = Http::post( $parsoid . '/' . $page->getPrefixedDBkey(),
				array( 'postData' => array( 'content' => $params['html'] ) )
			);

			if ( $wikitext ) {

				/* Save Page */
				$flags = $params['minor'] === 'true' ? EDIT_MINOR : 0;

				$wikiPage = WikiPage::factory( $page );
				$status = $wikiPage->doEdit( 
					$wikitext, 
					$params['summary'],
					$flags
				);
				
				// Check status ?
				// $status->ok === true ?

				// Add / Remove from watch list.
				if( $params['watch'] === 'true' ) {
					if ( $user->isWatched( $page ) === false ) {
						$user->addWatch( $page );
					}
				} else {
					// Remove from watchlist? 
					if ( $user->isWatched( $page ) === true ) {
						$user->removeWatch( $page );
					}
				}

				/* Get page content */
				// NOTE: possibly return content from revision object vs current rev ?
				// $revisionObj = $status->value['revision'];
				
				$apiParams = array(
					'action' => 'parse',
					'page' => $page
				);
				$api = new ApiMain(
					new DerivativeRequest(
						$this->getRequest(),
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
			'minor' => array(
				ApiBase::PARAM_REQUIRED => false,
			),
			'watch' => array(
				ApiBase::PARAM_REQUIRED => false,
			),
			'html' => array(
				ApiBase::PARAM_REQUIRED => false,
			),
			'summary' => null
		);
	}

	public function needsToken() {
		return false;
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}

	public function getParamDescription() {
		return array(
			'page' => 'The page to perform actions on.',
			'paction' => 'Which action? parse or save.',
			'minor' => 'Flag for minor edit.',
			'html' => 'HTML to send to parsoid in exchange for wikitext'
		);
	}

	public function getDescription() {
		return 'Returns HTML5 for a page from the parsoid service.';
	}
}
