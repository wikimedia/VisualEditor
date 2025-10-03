'use strict';

const element = document.createElement( 'a' );
const $element = $( element );
const userInput = 'something bad';

// Valid examples
ve.setAttributeSafe( element, 'href', userInput );
element.href = 'https://example.org';
$element.attr( 'href', 'https://example.org' );
$element.attr( { href: 'https://example.org' } );
element.setAttribute( 'href', 'https://example.org' );
element.setAttributeNS( '', 'href', 'https://example.org' );

// Invalid examples
// eslint-disable-next-line local/no-unsanitized-href
element.href = userInput;
// eslint-disable-next-line local/no-unsanitized-href
$element.attr( 'href', userInput );
// eslint-disable-next-line local/no-unsanitized-href
$element.attr( { href: userInput } );
// eslint-disable-next-line local/no-unsanitized-href
element.setAttribute( 'href', userInput );
// eslint-disable-next-line local/no-unsanitized-href
element.setAttributeNS( '', 'href', userInput );
