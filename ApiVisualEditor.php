<?php
/**
 * Parsoid API wrapper.
 *
 * @file
 * @ingroup Extensions
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

class ApiVisualEditor extends ApiBase {
	protected function getHTML( $title, $parserParams ) {
		global $wgVisualEditorParsoidURL, $wgVisualEditorParsoidPrefix,
			$wgVisualEditorParsoidTimeout;
		if ( $title->exists() ) {
			if ( $parserParams['oldid'] === 0 ) {
				$parserParams['oldid'] = ''; // Parsoid wants empty string rather than zero
			}
			$revision = Revision::newFromId( $parserParams['oldid'] );
			if ( $revision === null ) {
				return false;
			}
			$parserParams['touched'] = $title->getTouched();
			$parserParams['cache'] = 1;

			$req = MWHttpRequest::factory( wfAppendQuery(
					$wgVisualEditorParsoidURL . '/' . $wgVisualEditorParsoidPrefix .
						'/' . urlencode( $title->getPrefixedDBkey() ),
					$parserParams
				),
				array(
					'method' => 'GET',
					'timeout' => $wgVisualEditorParsoidTimeout
				)
			);
			$status = $req->execute();

			if ( $status->isOK() ) {
				$content = $req->getContent();
			} else if ( $status->isGood() ) {
				$this->dieUsage( $req->getContent(), 'parsoidserver-http-'.$req->getStatus() );
			} else if ( $errors = $status->getErrorsByType( 'error' ) ) {
				$error = $errors[0];
				$code = $error['message'];
				if( count( $error['params'] ) ) {
					$message = $error['params'][0];
				} else {
					$message = 'MWHttpRequest error';
				}
				$this->dieUsage( $message, 'parsoidserver-'.$code );
			}

			if ( $content === false ) {
				return false;
			}
			$timestamp = $revision->getTimestamp();
		} else {
			$content = '';
			$timestamp = wfTimestampNow();
		}
		return array(
			'content' => $content,
			'basetimestamp' => $timestamp,
			'starttimestamp' => wfTimestampNow()
		);
	}

	protected function postHTML( $title, $html, $parserParams ) {
		global $wgVisualEditorParsoidURL, $wgVisualEditorParsoidPrefix,
			$wgVisualEditorParsoidTimeout;
		if ( $parserParams['oldid'] === 0 ) {
			$parserParams['oldid'] = '';
		}
		return Http::post(
			$wgVisualEditorParsoidURL . '/' . $wgVisualEditorParsoidPrefix .
				'/' . urlencode( $title->getPrefixedDBkey() ),
			array(
				'postData' => array( 
					'content' => $html,
					'oldid' => $parserParams['oldid'] 
				),
				'timeout' => $wgVisualEditorParsoidTimeout
			)
		);
	}

	protected function saveWikitext( $title, $wikitext, $params ) {
		$apiParams = array(
			'action' => 'edit',
			'title' => $title->getPrefixedDBkey(),
			'text' => $wikitext,
			'summary' => $params['summary'],
			'basetimestamp' => $params['basetimestamp'],
			'starttimestamp' => $params['starttimestamp'],
			'token' => $params['token'],
		);
		if ( $params['minor'] ) {
			$apiParams['minor'] = true;
		}
		// FIXME add some way that the user's preferences can be respected
		$apiParams['watchlist'] = $params['watch'] ? 'watch' : 'unwatch';
		$api = new ApiMain(
			new DerivativeRequest(
				$this->getRequest(),
				$apiParams,
				true // was posted
			),
			true // enable write
		);
		$api->execute();
		return $api->getResultData();
	}

	protected function parseWikitext( $title ) {
		$apiParams = array(
			'action' => 'parse',
			'page' => $title->getPrefixedDBkey()
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
		$content = isset( $result['parse']['text']['*'] ) ? $result['parse']['text']['*'] : false;
		$revision = Revision::newFromId( $result['parse']['revid'] );
		$timestamp = $revision ? $revision->getTimestamp() : wfTimestampNow();

		if ( $content === false || ( strlen( $content ) && $revision === null ) ) {
			return false;
		}

		return array(
			'content' => $content,
			'basetimestamp' => $timestamp,
			'starttimestamp' => wfTimestampNow()
		);
	}

	protected function diffWikitext( $title, $wikitext ) {
		$apiParams = array(
			'action' => 'query',
			'prop' => 'revisions',
			'titles' => $title->getPrefixedDBkey(),
			'rvdifftotext' => $wikitext
		);
		$api = new ApiMain(
			new DerivativeRequest(
				$this->getRequest(),
				$apiParams,
				false // was posted?
			),
			false // enable write?
		);
		$api->execute();
		$result = $api->getResultData();
		if ( !isset( $result['query']['pages'][$title->getArticleID()]['revisions'][0]['diff']['*'] ) ) {
			return false;
		}
		$diffRows = $result['query']['pages'][$title->getArticleID()]['revisions'][0]['diff']['*'];

		$context = new DerivativeContext( $this->getContext() );
		$context->setTitle( $title );
		$engine = new DifferenceEngine( $context );
		return $engine->addHeader(
			$diffRows,
			wfMessage( 'currentrev' )->parse(),
			wfMessage( 'yourtext' )->parse()
		);
	}

	public function execute() {
		global $wgVisualEditorNamespaces, $wgVisualEditorUseChangeTagging,
			$wgVisualEditorEditNotices;
		$user = $this->getUser();
		$params = $this->extractRequestParams();
		$page = Title::newFromText( $params['page'] );
		if ( !$page ) {
			$this->dieUsageMsg( 'invalidtitle', $params['page'] );
		}
		if ( !in_array( $page->getNamespace(), $wgVisualEditorNamespaces ) ) {
			$this->dieUsage( "VisualEditor is not enabled in namespace " .
				$page->getNamespace(), 'novenamespace' );
		}

		$parserParams = array( 'oldid' => $params['oldid'] );

		if ( $params['paction'] === 'parse' ) {
			$parsed = $this->getHTML( $page, $parserParams );
			// Dirty hack to provide the correct context for edit notices
			global $wgTitle; // FIXME NOOOOOOOOES
			$wgTitle = $page;
			$notices = $page->getEditNotices();
			if ( $user->isAnon() ) {
				$wgVisualEditorEditNotices[] = 'anoneditwarning';
			}
			if ( count( $wgVisualEditorEditNotices ) ) {
				foreach ( $wgVisualEditorEditNotices as $key ) {
					$notices[] = wfMessage( $key )->parseAsBlock();
				}
			}
			if ( $parsed === false ) {
				$this->dieUsage( 'Error contacting the Parsoid server', 'parsoidserver' );
			} else {
				$result = array_merge(
					array( 'result' => 'success', 'notices' => $notices ), $parsed
				);
			}
		} else if ( $params['paction'] === 'serialize' ) {
			if ( $params['html'] === null ) {
				$this->dieUsageMsg( 'missingparam', 'html' );
			}
			$serialized = array( 'content' => $this->postHTML( $page, $params['html'], $parserParams ) );
			if ( $serialized === false ) {
				$this->dieUsage( 'Error contacting the Parsoid server', 'parsoidserver' );
			} else {
				$result = array_merge( array( 'result' => 'success' ), $serialized );
			}
		} elseif ( $params['paction'] === 'save' || $params['paction'] === 'diff' ) {
			$wikitext = $this->postHTML( $page, $params['html'], $parserParams );

			if ( $wikitext === false ) {
				$this->dieUsage( 'Error contacting the Parsoid server', 'parsoidserver' );
			} else if ( $params['paction'] === 'save' ) {
				// Save page
				$editResult = $this->saveWikitext( $page, $wikitext, $params );
				if (
					!isset( $editResult['edit']['result'] ) ||
					$editResult['edit']['result'] !== 'Success'
				) {
					$result = array(
						'result' => 'error',
						'edit' => $editResult['edit']
					);
				} else {
					if ( isset( $editResult['edit']['newrevid'] ) && $wgVisualEditorUseChangeTagging ) {
						ChangeTags::addTags( 'visualeditor', null,
							intval( $editResult['edit']['newrevid'] ),
							null
						);
					}
					$result = $this->parseWikitext( $page );
					if ( $result === false ) {
						$this->dieUsage( 'Error contacting the Parsoid server', 'parsoidserver' );
					}
					$result['result'] = 'success';
					if ( isset( $editResult['edit']['newrevid'] ) ) {
						$result['newrevid'] = intval( $editResult['edit']['newrevid'] );
					}
				}
			} else if ( $params['paction'] === 'diff' ) {
				$diff = $this->diffWikitext( $page, $wikitext );
				if ( $diff === false ) {
					$this->dieUsage( 'Diff failed', 'difffailed' );
				}
				$result = array(
					'result' => 'success',
					'diff' => $diff
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
				ApiBase::PARAM_TYPE => array( 'parse', 'serialize', 'save', 'diff' ),
			),
			'token' => array(
				ApiBase::PARAM_REQUIRED => true,
			),
			'basetimestamp' => null,
			'starttimestamp' => null,
			'oldid' => array(
				ApiBase::PARAM_REQUIRED => true,
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_DFLT => 0
			),
			'minor' => null,
			'watch' => null,
			'html' => null,
			'summary' => null
		);
	}

	public function needsToken() {
		return true;
	}

	public function getTokenSalt() {
		return '';
	}

	public function mustBePosted() {
		return true;
	}

	public function isWriteMode() {
		return true;
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}

	public function getParamDescription() {
		return array(
			'page' => 'The page to perform actions on.',
			'paction' => 'Action to perform',
			'oldid' => 'The revision number to use. If zero, the empty string is passed to Parsoid to indicate new page creation.',
			'minor' => 'Flag for minor edit.',
			'html' => 'HTML to send to parsoid in exchange for wikitext',
			'summary' => 'Edit summary',
			'basetimestamp' => 'When saving, set this to the timestamp of the revision that was edited. Used to detect edit conflicts.',
			'starttimestamp' => 'When saving, set this to the timestamp of when the page was loaded. Used to detect edit conflicts.',
			'token' => 'Edit token',
		);
	}

	public function getDescription() {
		return 'Returns HTML5 for a page from the parsoid service.';
	}
}
