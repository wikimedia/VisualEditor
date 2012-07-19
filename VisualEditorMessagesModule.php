<?php
/**
 * Resource loader module for certain VisualEditor messages.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 *
 * @file
 * @author Roan Kattouw
 */

/**
 * Module for user preference customizations
 */
class VisualEditorMessagesModule extends ResourceLoaderModule {

	/* Protected Members */

	protected $modifiedTime = array();

	protected $origin = self::ORIGIN_CORE_INDIVIDUAL;

	/* Methods */

	public function getScript( ResourceLoaderContext $context ) {
		$messages = array(
			'summary' => wfMessage( 'summary' )->parse(),
			'minoredit' => wfMessage( 'minoredit' )->parse(),
			'watchthis' => wfMessage( 'watchthis' )->parse(),
		);
		return 've.specialMessages = ' .
			FormatJson::encode( $messages ) .
			';';
	}

	public function getMessages() {
		// We don't actually use the i18n on the client-side, but registering the messages
		// is needed to make cache invalidation work
		return array( 'summary', 'minoredit', 'watchthis' );
	}
	
	public function getDependencies() {
		return array( 'ext.visualEditor.base' );
	}
}
