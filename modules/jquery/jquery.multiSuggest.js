/*
 * jQuery multiSuggeset Plugin v.01
 *
 * Copyright 2012, Rob Moen
 * http://sane.ly
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Example:
 *
	// Input element.
	var $input = $( '#exampleInput' );
	// Multi Suggest configuration.
	var options = {
		'parent': $input.parent(),
		'prefix': 'example-multi',

		// Build suggestion groups in order.
		'suggestions': function( params ) {
			// Generic params object.
			var example = params.example,
				example2 = params.example2,
				query = params.query;
				groups = {
					// Set 1
					query: {
						label: 'Query',
						items: [query],
						itemClass: 'query-class'
					},
					// Set 2
					exampleGroup: {
						label: 'Example 1',
						items: example,
						itemClass: 'example-class'
					},
					// Set 3
					exampleGroup2: {
						label: 'Example 2',
						items: example2,
						itemClass: 'example-class'
					}
				};
			// Return the groups object.
			return groups;
		},
		// Called on succesfull input.
		'input': function( callback ) {
			var query = $input.val();
			// Example params object.
			var params = {
					query: query,
					example: ['example item 1', 'example item 2', 'example item 3', 'example item 4'],
					example2: ['example item 5', 'example item 6']
			};
			// Build with params.
			callback( params );
		}
	};

	// Setup
	$input.multiSuggest( options );

 */
( function ( $ ) {
	$.fn.multiSuggest = function ( options ) {
		return this.each( function() {
			// Private members.
			var inputTimer = null,
				visible = false,
				focused = false,
				$input = $( this ),
				cachedInput = '',
				$multiSuggest;

			// Merge options with default configuration.
			$.extend( {
				doc: document,
				prefix: 'multi'
			}, options );

			// DOM Setup.
			$multiSuggest =
				$( '<div>', options.doc )
					.prop( 'class', options.prefix + '-suggest-select' )
					.hide()
					.appendTo( options.parent );

			/* Methods */

			// Hides & Show MultiSuggest.
			function toggle() {
				if ( visible ) {
					close();
				} else {
					open();
				}
			}
			// Call configured input method and supply the private build method as callback.
			function onInput() {
				if ( typeof options.input === 'function' ) {
					options.input.call( $input, function( params, callback ){
						build( params );
					} );
				}
			}
			// Opens the MultiSuggest dropdown.
			function open() {
				if ( !visible ) {
					// Call input method if cached value is stale
					if (
						$input.val() !== '' &&
						$input.val() !== cachedInput
					) {
						cachedInput = $input.val();
						onInput();
					} else {
						// Show if there are suggestions.
						if ( $multiSuggest.children().length > 0 ) {
							visible = true;
							$multiSuggest.show();
						}
					}
				}
			}
			// Closes the dropdown.
			function close() {
				if ( visible ) {
					setTimeout( function() {
						visible = false;
						$multiSuggest.hide();
					}, 100 );
				}
			}
			// When an item is selected in the dropdown.
			function select( text ) {
				// Cache input.
				cachedInput = text;
				$input.val( text );
				close();
			}
			// When an item is "clicked".
			// Use of mousedown to prevent blur.
			function onItemMousedown ( e ) {
				e.preventDefault();
				$multiSuggest
					.find( '.' + options.prefix + '-suggest-item' )
					.removeClass( 'selected' );
				$( this ).addClass( 'selected' );
				select.call( this, $( this ).text() );
			}
			// Adds a group to the dropdown.
			function addGroup( name, group ) {
				var $groupWrap,
					$group,
					$item,
					i;
				// Add a container with a label for this group.
				$group = $( '<div>', options.doc )
					.prop( 'class', options.prefix + '-suggest-container' )
					.append(
						$( '<div>', options.doc )
							.prop( 'class', options.prefix + '-suggest-label' )
							.text( group.label )
					).append(
						$( '<div>', options.doc )
							.prop( 'class', options.prefix + '-suggest-wrap' )
					// Add a clear break.
					).append(
						$( '<div>', options.doc ).css( 'clear', 'both' )
					);
				// Add group
				$multiSuggest.append( $group );

				// Find the group wrapper element.
				$groupWrap = $group.find( '.' + options.prefix + '-suggest-wrap' );
				// If no items, add a dummy element to take up space.
				if ( group.items.length === 0 ) {
					$groupWrap.append(
						$( '<div>', options.doc )
							.prop( 'class',  options.prefix + '-suggest-dummy-item' )
							.text( ' ' )
					);
				}
				// Add each item.
				for( i = 0; i < group.items.length; i++ ) {
					$item = $( '<div>', options.doc )
						.prop( 'class', options.prefix + '-suggest-item ' + group.itemClass )
						.text( group.items[i] )
						.on( 'mousedown', onItemMousedown )
						.appendTo( $groupWrap );
					// Select this item by default
					if ( group.items[i].toLowerCase() === $input.val().toLowerCase() ) {
						$item.addClass( 'selected' );
					}
				}
			}
			// Build the dropdown.
			// Fired as callback in configured input event.
			function build( params ) {
				var suggestions = options.suggestions( params ),
					group;
				// Setup groups
				$multiSuggest.empty();
				if ( suggestions !== undefined ) {
					for ( group in suggestions ) {
						if ( $.isPlainObject( suggestions[group] ) ) {
							addGroup( group, suggestions[group] );
						}
					}
					// Open dropdown.
					open();
				}
			}
			// Bind target input events
			$input.on( {
				// Handle any change to the input.
				'keyup change cut paste': function( e ) {
					var input = this;
					// Throttle input.
					clearTimeout( inputTimer );
					inputTimer = setTimeout( function() {
						if ( $input.val() !== '' ) {
							// Check for difference.
							if ( $input.val() !== cachedInput ) {
								onInput();
							}
						} else if ( $input.val() === '' ) {
							// No Text, close.
							if ( visible ) {
								close();
							}
						}
						// Cache
						cachedInput = $input.val();
					}, 250 );
				},
				// Handle arrow up and down keys.
				'keydown': function( e ) {
					var $item,
						$items = $multiSuggest
							.find( '.' + options.prefix + '-suggest-item' ),
						selected = 0;

					// Find the selected index.
					$.each( $items, function( i, e ){
						if( $( this ).hasClass( 'selected' ) ) {
							selected = i;
						}
					});
					// Down arrow
					if ( e.which === 40 ) {
						e.preventDefault();
						// If not visible, open and do nothing.
						if ( !visible ) {
							open();
							return;
						}
						selected = ( selected + 1 ) % $items.length;
						$items.removeClass( 'selected' );
						$( $items[selected] ).addClass( 'selected' );
					// Up Arrow
					} else if ( e.which === 38 ) {
						e.preventDefault();
						// If not visible, open and do nothing.
						if ( !visible ) {
							open();
							return;
						}
						selected = ( selected + $items.length - 1 ) % $items.length;
						$items.removeClass( 'selected' );
						$( $items[selected] ).addClass( 'selected' );
					// Enter key.
					} else if ( e.which === 13 ) {
						// Only if the dropdown is open.
						if ( visible ) {
							e.preventDefault();
							$item = $multiSuggest
								.find( '.' + options.prefix + '-suggest-item.selected' );
							if ( $item.length > 0 ) {
								select.call( this, $item.text() );
							} else {
								close();
							}
							return;
						}
					}
				},
				'focus': function(){
					focused = true;
					open();
				},
				'blur': function(){
					focused = false;
					close();
				},
				'mousedown': function(){
					if ( focused ) {
						toggle();
					}
				}
			} );
			return this;
		} );
	};
}( jQuery ) );
