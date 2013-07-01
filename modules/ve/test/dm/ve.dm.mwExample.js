/*!
 * VisualEditor DataModel MediaWiki example data sets.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * @class
 * @singleton
 * @ignore
 */
ve.dm.mwExample = {};

ve.dm.mwExample.MWInlineImageHtml = '<span typeof="mw:Image" class="foo mw-valign-text-top" data-parsoid="{&quot;tsr&quot;:[0,24],&quot;optList&quot;:[{&quot;ck&quot;:&quot;width&quot;,&quot;ak&quot;:&quot;500px&quot;}],&quot;cacheKey&quot;:&quot;[[Image:Wiki.png|500px]]&quot;,&quot;img&quot;:{&quot;h&quot;:155,&quot;w&quot;:135,&quot;wdset&quot;:true},&quot;dsr&quot;:[0,24,null,null]}"><a href="./File:Wiki.png" data-parsoid="{&quot;a&quot;:{&quot;href&quot;:&quot;./File:Wiki.png&quot;}}"><img resource="./File:Wiki.png" src="http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png" height="155" width="135" data-parsoid="{&quot;a&quot;:{&quot;resource&quot;:&quot;./File:Wiki.png&quot;,&quot;width&quot;:&quot;135&quot;},&quot;sa&quot;:{&quot;resource&quot;:&quot;Image:Wiki.png&quot;,&quot;width&quot;:&quot;500&quot;}}"></a></span>';
ve.dm.mwExample.MWTransclusion = {
	'blockSpan':         '<span about="#mwt1" typeof="mw:Transclusion" data-mw="{&quot;target&quot;:{&quot;wt&quot;:&quot;Test&quot;},&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;Hello, world!&quot;}},&quot;id&quot;:&quot;mwt1&quot;}" data-parsoid="{&quot;tsr&quot;:[18,40],&quot;src&quot;:&quot;{{Test|Hello, world!}}&quot;,&quot;dsr&quot;:[18,40,null,null]}"></span>',
	'blockSpanModified': '<span about="#mwt1" typeof="mw:Transclusion" data-mw="{&quot;id&quot;:&quot;mwt1&quot;,&quot;target&quot;:{&quot;wt&quot;:&quot;Test&quot;},&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;Hello, globe!&quot;}}}" data-parsoid="{&quot;tsr&quot;:[18,40],&quot;src&quot;:&quot;{{Test|Hello, world!}}&quot;,&quot;dsr&quot;:[18,40,null,null]}"></span>',
	'blockContent': '<p about="#mwt1" data-parsoid="{}">Hello, world!</p>',
	'inlineOpen':         '<span about="#mwt1" typeof="mw:Transclusion" data-mw="{&quot;id&quot;:&quot;mwt1&quot;,&quot;target&quot;:{&quot;wt&quot;:&quot;Inline&quot;},&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;1,234&quot;}}}" data-parsoid="{&quot;tsr&quot;:[18,34],&quot;src&quot;:&quot;{{Inline|1,234}}&quot;,&quot;dsr&quot;:[18,34,null,null]}">',
	'inlineOpenModified': '<span about="#mwt1" typeof="mw:Transclusion" data-mw="{&quot;id&quot;:&quot;mwt1&quot;,&quot;target&quot;:{&quot;wt&quot;:&quot;Inline&quot;},&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;5,678&quot;}}}" data-parsoid="{&quot;tsr&quot;:[18,34],&quot;src&quot;:&quot;{{Inline|1,234}}&quot;,&quot;dsr&quot;:[18,34,null,null]}">',
	'inlineContent': '$1,234.00',
	'inlineClose': '</span>',
	'mixed': '<link about="#mwt1" rel="mw:WikiLink/Category" typeof="mw:Transclusion" data-mw="{&quot;id&quot;:&quot;mwt1&quot;,&quot;target&quot;:{&quot;wt&quot;:&quot;Inline&quot;},&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;5,678&quot;}}}"><span about="#mwt1">Foo</span>',
	'pairOne': '<p about="#mwt1" typeof="mw:Transclusion" data-mw="{&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;foo&quot;}}}" data-parsoid="1">foo</p>',
	'pairTwo': '<p about="#mwt2" typeof="mw:Transclusion" data-mw="{&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;foo&quot;}}}" data-parsoid="2">foo</p>'
};
ve.dm.mwExample.MWTransclusion.blockData = {
	'type': 'mwTransclusionBlock',
	'attributes': {
		'mw': {
			'id': 'mwt1',
			'target': { 'wt' : 'Test' },
			'params': {
				'1': { 'wt': 'Hello, world!' }
			}
		},
		'originalDomElements': $( ve.dm.mwExample.MWTransclusion.blockSpan + ve.dm.mwExample.MWTransclusion.blockContent ).toArray(),
		'originalMw': '{\"target\":{\"wt\":\"Test\"},\"params\":{\"1\":{\"wt\":\"Hello, world!\"}},\"id\":\"mwt1\"}',
		'originalIndex': 0
	},
	'htmlAttributes': [
		{ 'values': {
			'about': '#mwt1',
			'data-mw': '{\"target\":{\"wt\":\"Test\"},\"params\":{\"1\":{\"wt\":\"Hello, world!\"}},\"id\":\"mwt1\"}',
			'data-parsoid': '{\"tsr\":[18,40],\"src\":\"{{Test|Hello, world!}}\",\"dsr\":[18,40,null,null]}',
			'typeof': 'mw:Transclusion'
		} },
		{ 'values': {
			'about': '#mwt1',
			'data-parsoid': '{}'
		} }
	]
};
ve.dm.mwExample.MWTransclusion.inlineData = {
	'type': 'mwTransclusionInline',
	'attributes': {
		'mw': {
			'id': 'mwt1',
			'target': { 'wt' : 'Inline' },
			'params': {
				'1': { 'wt': '1,234' }
			}
		},
		'originalDomElements': $( ve.dm.mwExample.MWTransclusion.inlineOpen + ve.dm.mwExample.MWTransclusion.inlineContent + ve.dm.mwExample.MWTransclusion.inlineClose ).toArray(),
		'originalMw': '{\"id\":\"mwt1\",\"target\":{\"wt\":\"Inline\"},\"params\":{\"1\":{\"wt\":\"1,234\"}}}',
		'originalIndex': 0
	},
	'htmlAttributes': [ { 'values': {
		'about': '#mwt1',
		'data-mw': '{\"id\":\"mwt1\",\"target\":{\"wt\":\"Inline\"},\"params\":{\"1\":{\"wt\":\"1,234\"}}}',
		'data-parsoid': '{\"tsr\":[18,34],\"src\":\"{{Inline|1,234}}\",\"dsr\":[18,34,null,null]}',
		'typeof': 'mw:Transclusion'
	} } ]
};
ve.dm.mwExample.MWTransclusion.mixedDataOpen = {
	'type': 'mwTransclusionInline',
	'attributes': {
		'mw': {
			'id': 'mwt1',
			'target': { 'wt': 'Inline' },
			'params': {
				'1': { 'wt': '5,678' }
			}
		},
		'originalDomElements': $( ve.dm.mwExample.MWTransclusion.mixed ).toArray(),
		'originalMw': '{\"id\":\"mwt1\",\"target\":{\"wt\":\"Inline\"},\"params\":{\"1\":{\"wt\":\"5,678\"}}}',
		'originalIndex': 0
	},
	'htmlAttributes': [
		{ 'values': {
			'about': '#mwt1',
			'rel': 'mw:WikiLink/Category',
			'typeof': 'mw:Transclusion',
			'data-mw': '{\"id\":\"mwt1\",\"target\":{\"wt\":\"Inline\"},\"params\":{\"1\":{\"wt\":\"5,678\"}}}'
		} },
		{ 'values': { 'about': '#mwt1' } }
	]
};
ve.dm.mwExample.MWTransclusion.mixedDataClose = { 'type': '/mwTransclusionInline' };

ve.dm.mwExample.MWTransclusion.blockParamsHash = ve.getHash( ve.dm.MWTransclusionNode.static.getHashObject( ve.dm.mwExample.MWTransclusion.blockData ) );
ve.dm.mwExample.MWTransclusion.blockStoreItems = {
	'hash': ve.dm.mwExample.MWTransclusion.blockParamsHash,
	'value': $( ve.dm.mwExample.MWTransclusion.blockSpan + ve.dm.mwExample.MWTransclusion.blockContent ).toArray()
};

ve.dm.mwExample.MWTransclusion.inlineParamsHash = ve.getHash( ve.dm.MWTransclusionNode.static.getHashObject( ve.dm.mwExample.MWTransclusion.inlineData ) );
ve.dm.mwExample.MWTransclusion.inlineStoreItems = {
	'hash': ve.dm.mwExample.MWTransclusion.inlineParamsHash,
	'value': $( ve.dm.mwExample.MWTransclusion.inlineOpen + ve.dm.mwExample.MWTransclusion.inlineContent + ve.dm.mwExample.MWTransclusion.inlineClose ).toArray()
};

ve.dm.mwExample.MWTransclusion.mixedParamsHash = ve.getHash( ve.dm.MWTransclusionNode.static.getHashObject( ve.dm.mwExample.MWTransclusion.mixedDataOpen ) );
ve.dm.mwExample.MWTransclusion.mixedStoreItems = {
	'hash': ve.dm.mwExample.MWTransclusion.mixedParamsHash,
	'value': $( ve.dm.mwExample.MWTransclusion.mixed ).toArray()
};


ve.dm.mwExample.domToDataCases = {
	'mw:Image': {
		'html': '<body><p>' + ve.dm.mwExample.MWInlineImageHtml + '</p></body>',
		'data': [
			{ 'type': 'paragraph' },
			{
				'type': 'mwInlineImage',
				'attributes': {
					'src': 'http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png',
					'href': './File:Wiki.png',
					'width': 135,
					'height': 155,
					'isLinked': true,
					'valign': 'text-top',
					'resource': './File:Wiki.png',
					'type': 'inline',
					'originalClasses': 'foo mw-valign-text-top',
					'unrecognizedClasses': ['foo']
				},
				'htmlAttributes': [
					{
						'values': {
							'data-parsoid': '{\"tsr\":[0,24],\"optList\":[{\"ck\":\"width\",\"ak\":\"500px\"}],\"cacheKey\":\"[[Image:Wiki.png|500px]]\",\"img\":{\"h\":155,\"w\":135,\"wdset\":true},\"dsr\":[0,24,null,null]}'
						},
						'children': [
							{
								'values': {
									'data-parsoid': '{\"a\":{\"href\":\"./File:Wiki.png\"}}'
								},
								'children': [
									{
										'values': {
											'data-parsoid': '{\"a\":{\"resource\":\"./File:Wiki.png\",\"width\":\"135\"},\"sa\":{\"resource\":\"Image:Wiki.png\",\"width\":\"500\"}}'
										}
									}
								]
							}
						]
					}
				]
			},
			{ 'type': '/mwInlineImage' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'mw:Transclusion (block level)': {
		'html': '<body>' + ve.dm.mwExample.MWTransclusion.blockSpan + ve.dm.mwExample.MWTransclusion.blockContent + '</body>',
		'data': [
			ve.dm.mwExample.MWTransclusion.blockData,
			{ 'type': '/mwTransclusionBlock' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		],
		'storeItems': [
			ve.dm.mwExample.MWTransclusion.blockStoreItems
		],
		'normalizedHtml': ve.dm.mwExample.MWTransclusion.blockSpan + ve.dm.mwExample.MWTransclusion.blockContent
	},
	'mw:Transclusion (block level - modified)': {
		'html': '<body>' + ve.dm.mwExample.MWTransclusion.blockSpan + ve.dm.mwExample.MWTransclusion.blockContent + '</body>',
		'data': [
			ve.dm.mwExample.MWTransclusion.blockData,
			{ 'type': '/mwTransclusionBlock' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		],
		'storeItems': [
			ve.dm.mwExample.MWTransclusion.blockStoreItems
		],
		'modify': function ( data ) {
			data[0].attributes.mw.params['1'].wt = 'Hello, globe!';
		},
		'normalizedHtml': ve.dm.mwExample.MWTransclusion.blockSpanModified
	},
	'mw:Transclusion (inline)': {
		'html': '<body>' + ve.dm.mwExample.MWTransclusion.inlineOpen + ve.dm.mwExample.MWTransclusion.inlineContent + ve.dm.mwExample.MWTransclusion.inlineClose + '</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			ve.dm.mwExample.MWTransclusion.inlineData,
			{ 'type': '/mwTransclusionInline' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		],
		'storeItems': [
			ve.dm.mwExample.MWTransclusion.inlineStoreItems
		],
		'normalizedHtml': ve.dm.mwExample.MWTransclusion.inlineOpen + ve.dm.mwExample.MWTransclusion.inlineContent + ve.dm.mwExample.MWTransclusion.inlineClose
	},
	'mw:Transclusion (inline - modified)': {
		'html': '<body>' + ve.dm.mwExample.MWTransclusion.inlineOpen + ve.dm.mwExample.MWTransclusion.inlineContent + ve.dm.mwExample.MWTransclusion.inlineClose + '</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			ve.dm.mwExample.MWTransclusion.inlineData,
			{ 'type': '/mwTransclusionInline' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		],
		'storeItems': [
			ve.dm.mwExample.MWTransclusion.inlineStoreItems
		],
		'modify': function ( data ) {
			data[1].attributes.mw.params['1'].wt = '5,678';
		},
		'normalizedHtml': ve.dm.mwExample.MWTransclusion.inlineOpenModified + ve.dm.mwExample.MWTransclusion.inlineClose
	},
	'two mw:Transclusion nodes with identical params but different htmlAttributes': {
		'html': '<body>' +
			ve.dm.mwExample.MWTransclusion.pairOne +
			ve.dm.mwExample.MWTransclusion.pairTwo +
		'</body>',
		'data': [
			{
				'type': 'mwTransclusionBlock',
				'attributes': {
					'mw': {
						'params': { '1': { 'wt': 'foo' } }
					},
					'originalMw': '{"params":{"1":{"wt":"foo"}}}',
					'originalDomElements': $( ve.dm.mwExample.MWTransclusion.pairOne ).toArray(),
					'originalIndex': 0
				},
				'htmlAttributes': [
					{
						'values': {
							'about': '#mwt1',
							'data-mw': '{"params":{"1":{"wt":"foo"}}}',
							'data-parsoid': '1',
							'typeof': 'mw:Transclusion'
						}
					}
				]
			},
			{ 'type': '/mwTransclusionBlock' },
			{
				'type': 'mwTransclusionBlock',
				'attributes': {
					'mw': {
						'params': { '1': { 'wt': 'foo' } }
					},
					'originalMw': '{"params":{"1":{"wt":"foo"}}}',
					'originalDomElements': $( ve.dm.mwExample.MWTransclusion.pairTwo ).toArray(),
					'originalIndex': 0
				},
				'htmlAttributes': [
					{
						'values': {
							'about': '#mwt2',
							'data-mw': '{"params":{"1":{"wt":"foo"}}}',
							'data-parsoid': '2',
							'typeof': 'mw:Transclusion'
						}
					}
				]
			},
			{ 'type': '/mwTransclusionBlock' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		],
		'storeItems': [
			{
				'hash': '{"mw":{"params":{"1":{"wt":"foo"}}},"type":"mwTransclusionBlock"}',
				'value': $( '<p about="#mwt1" typeof="mw:Transclusion" data-mw="{&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;foo&quot;}}}" data-parsoid="1">foo</p>' ).toArray()
			}
		]
	},
	'mw:Reference': {
		'html':
			'<body>' +
				'<p>Foo' +
					'<span id="cite_ref-bar-1-0" class="reference" about="#mwt5" typeof="mw:Extension/ref" ' +
						'data-parsoid="{}" ' +
						'data-mw="{&quot;name&quot;:&quot;ref&quot;,&quot;attrs&quot;:{&quot;name&quot;:&quot;bar&quot;}}">' +
						'<a href="#cite_note-bar-1" data-parsoid="{}">[1]</a>' +
					'</span>' +
					' Baz' +
					'<span id="cite_ref-quux-2-0" class="reference" about="#mwt6" typeof="mw:Extension/ref" ' +
						'data-parsoid="{}" ' +
						'data-mw="{&quot;name&quot;:&quot;ref&quot;,&quot;body&quot;:{&quot;html&quot;:&quot;Quux&quot;},&quot;attrs&quot;:{&quot;name&quot;:&quot;quux&quot;}}">' +
						'<a href="#cite_note-quux-2" data-parsoid="{}">[2]</a>' +
					'</span>' +
					' Whee' +
					'<span id="cite_ref-bar-1-1" class="reference" about="#mwt7" typeof="mw:Extension/ref" ' +
						'data-parsoid="{}" ' +
						'data-mw="{&quot;name&quot;:&quot;ref&quot;,&quot;body&quot;:{&quot;html&quot;:&quot;<a rel=\\&quot;mw:WikiLink\\&quot; ' +
						'href=\\&quot;./Bar\\&quot;>Bar</a>&quot;},&quot;attrs&quot;:{&quot;name&quot;:&quot;bar&quot;}}">' +
						'<a href="#cite_note-bar-1" data-parsoid="{}">[1]</a>' +
					'</span>' +
					' Yay' +
					'<span id="cite_ref-3-0" class="reference" about="#mwt8" typeof="mw:Extension/ref" ' +
						'data-parsoid="{}" ' +
						'data-mw="{&quot;name&quot;:&quot;ref&quot;,&quot;body&quot;:{&quot;html&quot;:&quot;No name&quot;},&quot;attrs&quot;:{&quot;group&quot;:&quot;g1&quot;}}">' +
						'<a href="#cite_note-3" data-parsoid="{}">[3]</a>' +
					'</span>' +
					' Quux' +
					'<span id="cite_ref-bar-1-2" class="reference" about="#mwt9" typeof="mw:Extension/ref" ' +
						'data-parsoid="{}" ' +
						'data-mw="{&quot;name&quot;:&quot;ref&quot;,&quot;body&quot;:{&quot;html&quot;:&quot;Different content&quot;},&quot;attrs&quot;:{&quot;name&quot;:&quot;bar&quot;}}">' +
						'<a href="#cite_note-bar-1" data-parsoid="{}">[1]</a>'+
					'</span>' +
				'</p>' +
				'<ol class="references" about="#mwt12" typeof="mw:Extension/references" ' +
					'data-mw="{&quot;name&quot;:&quot;references&quot;,&quot;attrs&quot;:{}}" ' +
					'data-parsoid="{}">' +
					'<li id="cite_note-quux-2"><a href="#cite_ref-quux-2-0">u2191</a>Quux</li>' +
				'</ol>' +
			'</body>',
		'data': [
			{ 'type': 'paragraph' },
			'F', 'o', 'o',
			{
				'type': 'mwReference',
				'attributes': {
					'about': '#mwt5',
					'listIndex': 0,
					'listGroup': 'mwReference/',
					'listKey': 'bar',
					'refGroup': '',
					'mw': { 'name': 'ref', 'attrs': { 'name': 'bar' } },
					'originalMw': '{"name":"ref","attrs":{"name":"bar"}}',
					'childDomElements': $( '<a href="#cite_note-bar-1" data-parsoid="{}">[1]</a>' ).toArray(),
					'contentsUsed': false
				},
				'htmlAttributes': [
					{
						'values': {
							'about': '#mwt5',
							'class': 'reference',
							'data-mw': '{"name":"ref","attrs":{"name":"bar"}}',
							'data-parsoid': '{}',
							'id': 'cite_ref-bar-1-0',
							'typeof': 'mw:Extension/ref'
						},
						'children': [
							{
								'values': {
									'href': '#cite_note-bar-1',
									'data-parsoid': '{}'
								}
							}
						]
					}
				]
			},
			{ 'type': '/mwReference' },
			' ', 'B', 'a', 'z',
			{
				'type': 'mwReference',
				'attributes': {
					'about': '#mwt6',
					'listIndex': 1,
					'listGroup': 'mwReference/',
					'listKey': 'quux',
					'refGroup': '',
					'mw': { 'name': 'ref', 'body': { 'html': 'Quux' }, 'attrs': { 'name': 'quux' } },
					'originalMw': '{"name":"ref","body":{"html":"Quux"},"attrs":{"name":"quux"}}',
					'childDomElements': $( '<a href="#cite_note-quux-2" data-parsoid="{}">[2]</a>' ).toArray(),
					'contentsUsed': true
				},
				'htmlAttributes': [
					{
						'values': {
							'about': '#mwt6',
							'class': 'reference',
							'data-mw': '{"name":"ref","body":{"html":"Quux"},"attrs":{"name":"quux"}}',
							'data-parsoid': '{}',
							'id': 'cite_ref-quux-2-0',
							'typeof': 'mw:Extension/ref'
						},
						'children': [
							{
								'values': {
									'href': '#cite_note-quux-2',
									'data-parsoid': '{}'
								}
							}
						]
					}
				]
			},
			{ 'type': '/mwReference' },
			' ', 'W', 'h', 'e', 'e',
			{
				'type': 'mwReference',
				'attributes': {
					'about': '#mwt7',
					'listIndex': 0,
					'listGroup': 'mwReference/',
					'listKey': 'bar',
					'refGroup': '',
					'mw': { 'name': 'ref', 'body': { 'html': '<a rel="mw:WikiLink" href="./Bar">Bar</a>' }, 'attrs': { 'name': 'bar' } },
					'originalMw': '{"name":"ref","body":{"html":"<a rel=\\"mw:WikiLink\\" href=\\"./Bar\\">Bar</a>"},"attrs":{"name":"bar"}}',
					'childDomElements': $( '<a href="#cite_note-bar-1" data-parsoid="{}">[1]</a>' ).toArray(),
					'contentsUsed': true
				},
				'htmlAttributes': [
					{
						'values': {
							'about': '#mwt7',
							'class': 'reference',
							'data-mw': '{"name":"ref","body":{"html":"<a rel=\\"mw:WikiLink\\" href=\\"./Bar\\">Bar</a>"},"attrs":{"name":"bar"}}',
							'data-parsoid': '{}',
							'id': 'cite_ref-bar-1-1',
							'typeof': 'mw:Extension/ref'
						},
						'children': [
							{
								'values': {
									'href': '#cite_note-bar-1',
									'data-parsoid': '{}'
								}
							}
						]
					}
				]
			},
			{ 'type': '/mwReference' },
			' ', 'Y', 'a', 'y',
			{
				'type': 'mwReference',
				'attributes': {
					'about': '#mwt8',
					'listIndex': 2,
					'listGroup': 'mwReference/g1',
					'listKey': null,
					'refGroup': 'g1',
					'mw': { 'name': 'ref', 'body': { 'html': 'No name' }, 'attrs': { 'group': 'g1' } },
					'originalMw': '{"name":"ref","body":{"html":"No name"},"attrs":{"group":"g1"}}',
					'childDomElements': $( '<a href="#cite_note-3" data-parsoid="{}">[3]</a>' ).toArray(),
					'contentsUsed': true
				},
				'htmlAttributes': [
					{
						'values': {
							'about': '#mwt8',
							'class': 'reference',
							'data-mw': '{"name":"ref","body":{"html":"No name"},"attrs":{"group":"g1"}}',
							'data-parsoid': '{}',
							'id': 'cite_ref-3-0',
							'typeof': 'mw:Extension/ref'
						},
						'children': [
							{
								'values': {
									'href': '#cite_note-3',
									'data-parsoid': '{}'
								}
							}
						]
					}
				]
			},
			{ 'type': '/mwReference' },
			' ', 'Q', 'u', 'u', 'x',
			{
				'type': 'mwReference',
				'attributes': {
					'about': '#mwt9',
					'listIndex': 0,
					'listGroup': 'mwReference/',
					'listKey': 'bar',
					'refGroup': '',
					'mw': { 'name': 'ref', 'body': { 'html': 'Different content' }, 'attrs': { 'name': 'bar' } },
					'originalMw': '{"name":"ref","body":{"html":"Different content"},"attrs":{"name":"bar"}}',
					'childDomElements': $( '<a href="#cite_note-bar-1" data-parsoid="{}">[1]</a>' ).toArray(),
					'contentsUsed': false
				},
				'htmlAttributes': [
					{
						'values': {
							'about': '#mwt9',
							'class': 'reference',
							'data-mw': '{"name":"ref","body":{"html":"Different content"},"attrs":{"name":"bar"}}',
							'data-parsoid': '{}',
							'id': 'cite_ref-bar-1-2',
							'typeof': 'mw:Extension/ref'
						},
						'children': [
							{
								'values': {
									'href': '#cite_note-bar-1',
									'data-parsoid': '{}'
								}
							}
						]
					}
				]
			},
			{ 'type': '/mwReference' },
			{ 'type': '/paragraph' },
			{
				'type': 'mwReferenceList',
				'attributes': {
					'about': '#mwt12',
					'mw': {
						'name': 'references',
						'attrs': {}
					},
					'originalMw': '{"name":"references","attrs":{}}',
					'domElements': $(
						'<ol class="references" about="#mwt12" typeof="mw:Extension/references" '+
							'data-mw="{&quot;name&quot;:&quot;references&quot;,&quot;attrs&quot;:{}}" ' +
							'data-parsoid="{}">'+
							'<li id="cite_note-quux-2"><a href="#cite_ref-quux-2-0">u2191</a>Quux</li>' +
						'</ol>' ).toArray(),
					'listGroup': 'mwReference/',
					'refGroup': ''
				}
			},
			{ 'type': '/mwReferenceList' },
			{ 'type': 'internalList' },
			{ 'type': 'internalItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			[
				'B',
				[ {
					'type': 'link/mwInternal',
					'attributes': {
						'title': 'Bar',
						'origTitle': 'Bar',
						'normalizedTitle': 'Bar',
						'hrefPrefix': './'
					},
					'htmlAttributes': [ { 'values': {
						'href': './Bar',
						'rel': 'mw:WikiLink'
					} } ]
				} ]
			],
			[
				'a',
				[ {
					'type': 'link/mwInternal',
					'attributes': {
						'title': 'Bar',
						'origTitle': 'Bar',
						'normalizedTitle': 'Bar',
						'hrefPrefix': './'
					},
					'htmlAttributes': [ { 'values': {
						'href': './Bar',
						'rel': 'mw:WikiLink'
					} } ]
				} ]
			],
			[
				'r',
				[ {
					'type': 'link/mwInternal',
					'attributes': {
						'title': 'Bar',
						'origTitle': 'Bar',
						'normalizedTitle': 'Bar',
						'hrefPrefix': './'
					},
					'htmlAttributes': [ { 'values': {
						'href': './Bar',
						'rel': 'mw:WikiLink'
					} } ]
				} ]
			],
			{ 'type': '/paragraph' },
			{ 'type': '/internalItem' },
			{ 'type': 'internalItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'Q', 'u', 'u', 'x',
			{ 'type': '/paragraph' },
			{ 'type': '/internalItem' },
			{ 'type': 'internalItem' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'N', 'o', ' ', 'n', 'a', 'm', 'e',
			{ 'type': '/paragraph' },
			{ 'type': '/internalItem' },
			{ 'type': '/internalList' }
		]
	},
	'mw:Reference with metadata': {
		'html': '<p><span about="#mwt2" class="reference" ' +
			'data-mw="{&quot;name&quot;:&quot;ref&quot;,&quot;body&quot;:' +
			'{&quot;html&quot;:&quot;Foo<!-- bar -->&quot;},&quot;attrs&quot;:{}}" ' +
			'id="cite_ref-1-0" rel="dc:references" typeof="mw:Extension/ref" data-parsoid="{}">' +
			'<a href="#cite_note-bar-1" data-parsoid="{}">[1]</a></span></p>',
		'data': [
			{ 'type': 'paragraph' },
			{
				'type': 'mwReference',
				'attributes': {
					'about': '#mwt2',
					'contentsUsed': true,
					'listGroup': 'mwReference/',
					'listIndex': 0,
					'listKey': null,
					'mw': {
						'attrs': {},
						'body': {
							'html': 'Foo<!-- bar -->'
						},
						'name': 'ref'
					},
					'originalMw': '{"name":"ref","body":{"html":"Foo<!-- bar -->"},"attrs":{}}',
					'childDomElements': $( '<a href="#cite_note-bar-1" data-parsoid="{}">[1]</a>' ).toArray(),
					'refGroup': ''
				},
				'htmlAttributes': [
					{
						'values': {
							'about': '#mwt2',
							'class': 'reference',
							'data-mw': '{"name":"ref","body":{"html":"Foo<!-- bar -->"},"attrs":{}}',
							'data-parsoid': '{}',
							'id': 'cite_ref-1-0',
							'rel': 'dc:references',
							'typeof': 'mw:Extension/ref'
						},
						'children': [ { 'values': { 'data-parsoid': '{}', 'href': '#cite_note-bar-1' } } ]
					}
				]
			},
			{ 'type': '/mwReference' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': 'internalItem' },
			{
				'internal': {
					'generated': 'wrapper'
				},
				'type': 'paragraph'
			},
			'F', 'o', 'o',
			{ 'type': '/paragraph' },
			{
				'type': 'alienMeta',
				'attributes': {
					'domElements': $( '<!-- bar -->' ).toArray()
				}
			},
			{ 'type': '/alienMeta' },
			{ 'type': '/internalItem' },
			{ 'type': '/internalList' }
		]
	},
	'internal link with ./ and ../': {
		'html': '<body><p><a rel="mw:WikiLink" href="./../../../Foo/Bar">Foo</a></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'F',
				[ {
					'type': 'link/mwInternal',
					'attributes': {
						'title': 'Foo/Bar',
						'origTitle': 'Foo/Bar',
						'normalizedTitle': 'Foo/Bar',
						'hrefPrefix': './../../../'
					},
					'htmlAttributes': [ { 'values': {
						'href': './../../../Foo/Bar',
						'rel': 'mw:WikiLink'
					} } ]
				} ]
			],
			[
				'o',
				[ {
					'type': 'link/mwInternal',
					'attributes': {
						'title': 'Foo/Bar',
						'origTitle': 'Foo/Bar',
						'normalizedTitle': 'Foo/Bar',
						'hrefPrefix': './../../../'
					},
					'htmlAttributes': [ { 'values': {
						'href': './../../../Foo/Bar',
						'rel': 'mw:WikiLink'
					} } ]
				} ]
			],
			[
				'o',
				[ {
					'type': 'link/mwInternal',
					'attributes': {
						'title': 'Foo/Bar',
						'origTitle': 'Foo/Bar',
						'normalizedTitle': 'Foo/Bar',
						'hrefPrefix': './../../../'
					},
					'htmlAttributes': [ { 'values': {
						'href': './../../../Foo/Bar',
						'rel': 'mw:WikiLink'
					} } ]
				} ]
			],
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'numbered external link': {
		'html': '<body><p><a rel="mw:ExtLink/Numbered" href="http://www.mediawiki.org/">[1]</a></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'[',
				[ {
					'type': 'link/mwExternal',
					'attributes': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/Numbered'
					},
					'htmlAttributes': [ { 'values': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/Numbered'
					} } ]
				} ]
			],
			[
				'1',
				[ {
					'type': 'link/mwExternal',
					'attributes': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/Numbered'
					},
					'htmlAttributes': [ { 'values': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/Numbered'
					} } ]
				} ]
			],
			[
				']',
				[ {
					'type': 'link/mwExternal',
					'attributes': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/Numbered'
					},
					'htmlAttributes': [ { 'values': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/Numbered'
					} } ]
				} ]
			],
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'URL link': {
		'html': '<body><p><a rel="mw:ExtLink/URL" href="http://www.mediawiki.org/">mw</a></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			[
				'm',
				[ {
					'type': 'link/mwExternal',
					'attributes': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/URL'
					},
					'htmlAttributes': [ { 'values': {
						'rel': 'mw:ExtLink/URL',
						'href': 'http://www.mediawiki.org/'
					} } ]
				} ]
			],
			[
				'w',
				[ {
					'type': 'link/mwExternal',
					'attributes': {
						'href': 'http://www.mediawiki.org/',
						'rel': 'mw:ExtLink/URL'
					},
					'htmlAttributes': [ { 'values': {
						'rel': 'mw:ExtLink/URL',
						'href': 'http://www.mediawiki.org/'
					} } ]
				} ]
			],
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation with wrapped comments and language links': {
		'html': '<body>Foo\n' +
			'<link rel="mw:WikiLink/Language" href="http://de.wikipedia.org/wiki/Foo">\n' +
			'<link rel="mw:WikiLink/Language" href="http://fr.wikipedia.org/wiki/Foo"></body>',
		'data': [
			{
				'type': 'paragraph',
				'internal': {
					'generated': 'wrapper',
					'whitespace': [ undefined, undefined, undefined, '\n' ]
				}
			},
			'F',
			'o',
			'o',
			{ 'type': '/paragraph' },
			{
				'type': 'mwLanguage',
				'attributes': {
					'href': 'http://de.wikipedia.org/wiki/Foo'
				},
				'htmlAttributes': [ { 'values': {
					'href': 'http://de.wikipedia.org/wiki/Foo',
					'rel': 'mw:WikiLink/Language'
				} } ],
				'internal': { 'whitespace': [ '\n', undefined, undefined, '\n' ] }
			},
			{ 'type': '/mwLanguage' },
			{
				'type': 'mwLanguage',
				'attributes': {
					'href': 'http://fr.wikipedia.org/wiki/Foo'
				 },
				 'htmlAttributes': [ { 'values': {
					'href': 'http://fr.wikipedia.org/wiki/Foo',
					'rel': 'mw:WikiLink/Language'
				} } ],
				'internal': { 'whitespace': [ '\n' ] }
			},
			{ 'type': '/mwLanguage' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'document with meta elements': {
		'html': '<body><!-- No content conversion --><meta property="mw:PageProp/nocc" /><p>Foo' +
			'<link rel="mw:WikiLink/Category" href="./Category:Bar" />Bar' +
			'<meta property="mw:foo" content="bar" />Ba<!-- inline -->z</p>' +
			'<meta property="mw:bar" content="baz" /><!--barbaz-->' +
			'<link rel="mw:WikiLink/Category" href="./Category:Foo_foo#Bar baz%23quux" />' +
			'<meta typeof="mw:Placeholder" data-parsoid="foobar" /></body>',
		'data': ve.dm.example.withMeta
	},
	'RDFa types spread across two attributes, about grouping is forced': {
		'html': '<body>' + ve.dm.mwExample.MWTransclusion.mixed + '</body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			ve.dm.mwExample.MWTransclusion.mixedDataOpen,
			ve.dm.mwExample.MWTransclusion.mixedDataClose,
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		],
		'storeItems': [
			ve.dm.mwExample.MWTransclusion.mixedStoreItems
		]
	},
	'mw:Entity': {
		'html': '<body><p>a<span typeof="mw:Entity">¢</span>b<span typeof="mw:Entity">¥</span><span typeof="mw:Entity">™</span></p></body>',
		'data': [
			{ 'type': 'paragraph' },
			'a',
			{
				'type': 'mwEntity',
				'attributes': { 'character': '¢' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			'b',
			{
				'type': 'mwEntity',
				'attributes': { 'character': '¥' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			{
				'type': 'mwEntity',
				'attributes': { 'character': '™' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'wrapping with mw:Entity': {
		'html': '<body>a<span typeof="mw:Entity">¢</span>b<span typeof="mw:Entity">¥</span><span typeof="mw:Entity">™</span></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'a',
			{
				'type': 'mwEntity',
				'attributes': { 'character': '¢' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			'b',
			{
				'type': 'mwEntity',
				'attributes': { 'character': '¥' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			{
				'type': 'mwEntity',
				'attributes': { 'character': '™' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'whitespace preservation with mw:Entity': {
		'html': '<body><p> a  <span typeof="mw:Entity"> </span>   b    <span typeof="mw:Entity">¥</span>\t<span typeof="mw:Entity">™</span></p></body>',
		'data': [
			{ 'type': 'paragraph', 'internal': { 'whitespace': [ undefined, ' ' ] } },
			'a',
			' ',
			' ',
			{
				'type': 'mwEntity',
				'attributes': { 'character': ' ' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			' ',
			' ',
			' ',
			'b',
			' ',
			' ',
			' ',
			' ',
			{
				'type': 'mwEntity',
				'attributes': { 'character': '¥' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			'\t',
			{
				'type': 'mwEntity',
				'attributes': { 'character': '™' },
				'htmlAttributes': [ { 'values': { 'typeof': 'mw:Entity' } } ]
			},
			{ 'type': '/mwEntity' },
			{ 'type': '/paragraph' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'category default sort key': {
		'html': '<body><meta property="mw:PageProp/categorydefaultsort" content="foo"></body>',
		'data': [
			{
				'type': 'mwDefaultSort',
				'attributes': {
					'content': 'foo'
				},
				'htmlAttributes': [ { 'values': {
					'content': 'foo',
					'property': 'mw:PageProp/categorydefaultsort'
				} } ]
			},
			{ 'type': '/mwDefaultSort' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'thumb image': {
		'html': '<body><figure typeof="mw:Image/Thumb" class="mw-halign-right foobar"><a href="Foo"><img src="Bar" width="1" height="2" resource="FooBar"></a><figcaption>abc</figcaption></figure></body>',
		'data': [
			{
				'type': 'mwBlockImage',
				'attributes': {
					'type': 'thumb',
					'align': 'right',
					'href': 'Foo',
					'src': 'Bar',
					'width': '1',
					'height': '2',
					'resource': 'FooBar',
					'originalClasses': 'mw-halign-right foobar',
					'unrecognizedClasses': ['foobar']
				}
			},
			{ 'type': 'mwImageCaption' },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
			'a', 'b', 'c',
			{ 'type': '/paragraph' },
			{ 'type': '/mwImageCaption' },
			{ 'type': '/mwBlockImage' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	},
	'attribute preservation does not crash due to text node split': {
		'html': '<body><figure typeof="mw:Image/Thumb" data-parsoid="{}"><a href="Foo" data-parsoid="{}"><img src="Bar" width="1" height="2" resource="FooBar" data-parsoid="{}"></a><figcaption data-parsoid="{}"> foo <a rel="mw:WikiLink" href="./Bar" data-parsoid="{}">bar</a> baz</figcaption></figure></body>',
		'data': [
			{
				'type': 'mwBlockImage',
				'attributes': {
					'type': 'thumb',
					'align': 'default',
					'href': 'Foo',
					'src': 'Bar',
					'width': '1',
					'height': '2',
					'resource': 'FooBar',
					'originalClasses': undefined,
					'unrecognizedClasses': []
				},
				'htmlAttributes': [ {
					'values': { 'data-parsoid': '{}' },
					'children': [
						{
							'values': { 'data-parsoid': '{}' },
							'children': [ {
								'values': { 'data-parsoid': '{}' }
							} ]
						},
						{
							'values': { 'data-parsoid': '{}' },
							'children': [
								{ 'values': { 'data-parsoid': '{}' } }
							]
						}
					 ]
				} ]
			},
			{ 'type': 'mwImageCaption', 'internal': { 'whitespace': [ undefined, ' ' ] } },
			{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper', 'whitespace': [ ' ' ] } },
			'f', 'o', 'o', ' ',
			[
				'b',
				[ {
					'type': 'link/mwInternal',
					'attributes': {
						'title': 'Bar',
						'origTitle': 'Bar',
						'normalizedTitle': 'Bar',
						'hrefPrefix': './'
					},
					'htmlAttributes': [ { 'values': { 'href': './Bar', 'rel': 'mw:WikiLink', 'data-parsoid': '{}' } } ]
				} ]
			],
			[
				'a',
				[ {
					'type': 'link/mwInternal',
					'attributes': {
						'title': 'Bar',
						'origTitle': 'Bar',
						'normalizedTitle': 'Bar',
						'hrefPrefix': './'
					},
					'htmlAttributes': [ { 'values': { 'href': './Bar', 'rel': 'mw:WikiLink', 'data-parsoid': '{}' } } ]
				} ]
			],
			[
				'r',
				[ {
					'type': 'link/mwInternal',
					'attributes': {
						'title': 'Bar',
						'origTitle': 'Bar',
						'normalizedTitle': 'Bar',
						'hrefPrefix': './'
					},
					'htmlAttributes': [ { 'values': { 'href': './Bar', 'rel': 'mw:WikiLink', 'data-parsoid': '{}' } } ]
				} ]
			],
			' ', 'b', 'a', 'z',
			{ 'type': '/paragraph' },
			{ 'type': '/mwImageCaption' },
			{ 'type': '/mwBlockImage' },
			{ 'type': 'internalList' },
			{ 'type': '/internalList' }
		]
	}
};
