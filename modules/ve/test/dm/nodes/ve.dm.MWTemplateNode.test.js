/*!
 * VisualEditor DataModel MWTemplateNode tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.dm.MWTemplateNode' );

/* Tests */

QUnit.test( 'getWikitext', function ( assert ) {
	var i, node, cases = [
		{
			'msg': 'mix of numbered and named parameters',
			'mw': {
				'target': { 'wt': 'foo' },
				'params': {
					'1': { 'wt': 'bar' },
					'baz': { 'wt': 'quux' }
				}
			},
			'wikitext': '{{foo|1=bar|baz=quux}}'
		},
		{
			'msg': 'parameter with self-closing nowiki',
			'mw': {
				'target': { 'wt': 'foo' },
				'params': {
					'bar': { 'wt': 'l\'<nowiki />\'\'\'Étranger\'\'\'' }
				}
			},
			'wikitext': '{{foo|bar=l\'<nowiki />\'\'\'Étranger\'\'\'}}'
		},
		{
			'msg': 'parameter with self-closing nowiki without space',
			'mw': {
				'target': { 'wt': 'foo' },
				'params': {
					'bar': { 'wt': 'l\'<nowiki/>\'\'\'Étranger\'\'\'' }
				}
			},
			'wikitext': '{{foo|bar=l\'<nowiki/>\'\'\'Étranger\'\'\'}}'
		},
		{
			'msg': 'parameter with spanning-nowiki',
			'mw': {
				'target': { 'wt': 'foo' },
				'params': {
					'bar': { 'wt': 'You should use <nowiki>\'\'\'</nowiki> to make things bold.' }
				}
			},
			'wikitext': '{{foo|bar=You should use <nowiki>\'\'\'</nowiki> to make things bold.}}'
		},
		{
			'msg': 'parameter with spanning-nowiki and nested template',
			'mw': {
				'target': { 'wt': 'foo' },
				'params': {
					'bar': { 'wt': 'You should try using <nowiki>{{ping|foo=bar|2=1}}</nowiki> as a template!' }
				}
			},
			'wikitext': '{{foo|bar=You should try using <nowiki>{{ping|foo=bar|2=1}}</nowiki> as a template!}}'
		},
	];
	QUnit.expect( cases.length );
	for ( i = 0; i < cases.length; i++ ) {
		node = new ve.dm.MWTemplateNode( 0,
			{ 'type': 'mwTemplate', 'attributes': { 'mw': cases[i].mw } }
		);
		assert.deepEqual( node.getWikitext(), cases[i].wikitext, cases[i].msg );
	}
} );
