/*!
 * VisualEditor UserInterface Actions TableAction tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.TableAction' );

/* Tests */

QUnit.test( 'create / insert / mergeCells / delete / changeCellStyle / moveRelative', ( assert ) => {
	const tableCellTail = [
			{ type: 'paragraph', internal: { generated: 'wrapper' } },
			{ type: '/paragraph' },
			{ type: '/tableCell' }
		],
		tableHeader = [
			{
				type: 'tableCell',
				attributes: {
					colspan: 1,
					rowspan: 1,
					style: 'header'
				}
			},
			...tableCellTail
		],
		tableData = [
			{
				type: 'tableCell',
				attributes: {
					colspan: 1,
					rowspan: 1,
					style: 'data'
				}
			},
			...tableCellTail
		],
		cases = [
			{
				rangeOrSelection: new ve.Range( 0 ),
				method: 'create',
				args: [ {
					cols: 1,
					rows: 1,
					attributes: { sortable: true }
				} ],
				expectedData: ( data ) => {
					data.splice( 0, 0,
						{ type: 'table', attributes: { sortable: true } },
						{ type: 'tableSection', attributes: { style: 'body' } },
						{ type: 'tableRow' },
						...tableData,
						{ type: '/tableRow' },
						{ type: '/tableSection' },
						{ type: '/table' }
					);
				},
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 10 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				},
				msg: 'create single cell table with attributes'
			},
			{
				rangeOrSelection: new ve.Range( 0 ),
				method: 'create',
				args: [ {
					cols: 1,
					rows: 1,
					caption: true
				} ],
				expectedData: ( data ) => {
					data.splice( 0, 0,
						{ type: 'table' },
						{ type: 'tableCaption' },
						{ type: 'paragraph', internal: { generated: 'wrapper' } },
						{ type: '/paragraph' },
						{ type: '/tableCaption' },
						{ type: 'tableSection', attributes: { style: 'body' } },
						{ type: 'tableRow' },
						...tableData,
						{ type: '/tableRow' },
						{ type: '/tableSection' },
						{ type: '/table' }
					);
				},
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 14 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				},
				msg: 'create single cell table with caption'
			},
			{
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 5, 37 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				},
				method: 'create',
				expectedData: () => {},
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 5, 37 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				},
				msg: 'create table with table selection is no-op'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				method: 'insert',
				args: [ 'col', 'after' ],
				expectedData: () => {},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'insert with linear selection is no-op'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				method: 'moveRelative',
				args: [ 'col', 'after' ],
				expectedData: () => {},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'moveRelative with linear selection is no-op'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				method: 'move',
				args: [ 'col', 0 ],
				expectedData: () => {},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'move with linear selection is no-op'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				method: 'delete',
				args: [ 'table' ],
				expectedData: () => {},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'delete with linear selection is no-op'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				method: 'delete',
				args: [ 'header' ],
				expectedData: () => {},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'changeCellStyle with linear selection is no-op'
			},
			{
				rangeOrSelection: new ve.Range( 1 ),
				method: 'mergeCells',
				expectedData: () => {},
				expectedRangeOrSelection: new ve.Range( 1 ),
				msg: 'mergeCells with linear selection is no-op'
			},
			{
				rangeOrSelection: new ve.Range( 0 ),
				method: 'create',
				args: [ {
					cols: 3,
					rows: 2,
					header: true
				} ],
				expectedData: ( data ) => {
					data.splice( 0, 0,
						{ type: 'table' },
						{ type: 'tableSection', attributes: { style: 'body' } },
						{ type: 'tableRow' },
						...tableHeader,
						...tableHeader,
						...tableHeader,
						{ type: '/tableRow' },
						{ type: 'tableRow' },
						...tableData,
						...tableData,
						...tableData,
						{ type: '/tableRow' },
						{ type: 'tableRow' },
						...tableData,
						...tableData,
						...tableData,
						{ type: '/tableRow' },
						{ type: '/tableSection' },
						{ type: '/table' }
					);
				},
				msg: 'create small table with header'
			},
			{
				html: ve.dm.example.mergedCellsHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 5,
					fromRow: 1,
					toCol: 5,
					toRow: 1
				},
				method: 'insert',
				args: [ 'col', 'after' ],
				expectedData: ( data ) => {
					data.splice( 168, 0, ...tableData );
					data.splice( 130, 0, ...tableData );
					data.splice( 116, 0, ...tableData );
					data.splice( 102, 0, ...tableData );
					data.splice( 82, 0, ...tableData );
					data.splice( 56, 0, ...tableData );
					data.splice( 33, 0, ...tableData );
				},
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 199 ),
					fromCol: 5,
					fromRow: 1,
					toCol: 5,
					toRow: 1
				},
				msg: 'insert column at end of table'
			},
			{
				html: ve.dm.example.mergedCellsHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 3,
					fromRow: 0,
					toCol: 3,
					toRow: 0
				},
				method: 'insert',
				args: [ 'col', 'before' ],
				expectedData: ( data ) => {
					data.splice( 150, 0, ...tableData );
					data[ 90 ].attributes.colspan = 4;
					data.splice( 76, 0, ...tableData );
					data.splice( 45, 0, ...tableData );
					data.splice( 18, 0, ...tableData );
				},
				msg: 'insert column in middle of table'
			},
			{
				html: '<table><tr></tr><tr><td>A</td><td>B</td></tr></table>',
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 18 ),
					fromCol: 0,
					fromRow: 1,
					toCol: 0,
					toRow: 1
				},
				method: 'insert',
				args: [ 'col', 'after' ],
				expectedData: ( data ) => {
					data.splice( 10, 0, ...tableData );
				},
				msg: 'insert column at middle of table with sparse row'
			},
			{
				html: '<table><tr></tr><tr><td>A</td><td>B</td></tr></table>',
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 18 ),
					fromCol: 1,
					fromRow: 1,
					toCol: 1,
					toRow: 1
				},
				method: 'insert',
				args: [ 'col', 'after' ],
				expectedData: ( data ) => {
					data.splice( 15, 0, ...tableData );
				},
				msg: 'insert column at end of table with sparse row'
			},
			{
				html: '<table><tr><td rowspan="3">a</td><td>b</td><td>c</td></tr></table>',
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 21 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 2
				},
				method: 'insert',
				args: [ 'row', 'after' ],
				expectedData: ( data ) => {
					data.splice( 19, 0,
						{ type: 'tableRow' },
						...tableData,
						{ type: '/tableRow' }
					);
				},
				msg: 'insert row after row containing cell with excessive rowspan'
			},
			{
				html: '<table><tr><td rowspan="3">a</td><td>b</td><td>c</td></tr></table>',
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 21 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 2
				},
				method: 'insert',
				args: [ 'col', 'after' ],
				expectedData: ( data ) => {
					data.splice( 8, 0, ...tableData );
				},
				msg: 'insert column after row containing cell with excessive rowspan'
			},
			{
				html: ve.dm.example.mergedCellsHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 0,
					fromRow: 6,
					toCol: 0,
					toRow: 6
				},
				method: 'insert',
				args: [ 'row', 'after' ],
				expectedData: ( data ) => {
					data.splice( 169, 0,
						{ type: 'tableRow' },
						...tableData,
						...tableData,
						...tableData,
						...tableData,
						...tableData,
						...tableData,
						{ type: '/tableRow' }
					);
				},
				msg: 'insert row at end of table'
			},
			{
				html: ve.dm.example.mergedCellsHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 0,
					fromRow: 3,
					toCol: 0,
					toRow: 3
				},
				method: 'insert',
				args: [ 'row', 'before' ],
				expectedData: ( data ) => {
					data[ 45 ].attributes.rowspan = 5;
					data.splice( 83, 0,
						{ type: 'tableRow' },
						...tableData,
						...tableData,
						...tableData,
						...tableData,
						...tableData,
						{ type: '/tableRow' }
					);
				},
				msg: 'insert row in middle of table'
			},
			{
				html: '<table><tr><th>a</th><td>b</td></tr></table>',
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 16 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				},
				method: 'insert',
				args: [ 'row', 'after' ],
				expectedData: ( data ) => {
					data.splice( 14, 0,
						{ type: 'tableRow' },
						...tableHeader,
						...tableData,
						{ type: '/tableRow' }
					);
				},
				msg: 'insert row of mixed styles'
			},
			{
				html: '<table><tr><th style="text-align:left">a</th><th align="center">b</th><th style="text-align : right">c</th></tr></table>',
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 16 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				},
				method: 'insert',
				args: [ 'row', 'after' ],
				expectedData: ( data ) => {
					const insertedRow = data.slice( 2, 19 )
						.filter( ( d ) => ![ 'a', 'b', 'c' ].includes( d ) )
						.map( ( d ) => {
							if ( d.type === 'tableCell' ) {
								// possibly unexpected behaviour: the new row also has <th> elements; are <td> preferred instead?
								const attributes = { ...d.attributes, colspan: 1, rowspan: 1 };
								delete attributes.originalTextAlign;
								d = { ...d, attributes };
							}
							return d;
						} );
					data.splice( 19, 0, ...insertedRow );
				},
				msg: 'insert row of mixed text alignment on th'
			},
			{
				html: '<table><tr style="text-align:center; vertical-align:bottom"><td style="text-align:left">a</td><td align="center" valign="middle">b</td><td style="text-align : right">c</td></tr></table>',
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 16 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				},
				method: 'insert',
				args: [ 'row', 'after' ],
				expectedData: ( data ) => {
					const insertedRow = data.slice( 2, 19 )
						.filter( ( d ) => ![ 'a', 'b', 'c' ].includes( d ) )
						.map( ( d ) => {
							if ( d.type === 'tableCell' ) {
								const attributes = { ...d.attributes, colspan: 1, rowspan: 1 };
								delete attributes.originalTextAlign;
								delete attributes.originalVerticalAlign;
								d = { ...d, attributes };
							} else if ( d.type === 'tableRow' ) {
								const attributes = { ...d.attributes };
								delete attributes.originalTextAlign;
								delete attributes.originalVerticalAlign;
								d = { ...d, attributes };
							}
							return d;
						} );
					data.splice( 19, 0, ...insertedRow );
				},
				msg: 'insert row of mixed text alignment on tr and td'
			},
			{
				html: ve.dm.example.mergedCellsHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 2,
					toRow: 1
				},
				method: 'mergeCells',
				args: [],
				expectedData: ( data ) => {
					data[ 3 ].attributes.colspan = 3;
					data[ 3 ].attributes.rowspan = 2;
					data.splice( 40, 5 );
					data.splice( 35, 5 );
					data.splice( 13, 5 );
					data.splice( 8, 5 );
				},
				msg: 'merge cells'
			},
			{
				html: ve.dm.example.mergedCellsHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 1,
					fromRow: 3,
					toCol: 3,
					toRow: 5
				},
				method: 'mergeCells',
				args: [],
				expectedData: ( data ) => {
					data[ 90 ].attributes.colspan = 1;
					data[ 90 ].attributes.rowspan = 1;
					data.splice( 124, 0, ...tableData, ...tableData, ...tableData );
					data.splice( 110, 0, ...tableData, ...tableData, ...tableData );
					data.splice( 96, 0, ...tableData, ...tableData );
				},
				msg: 'unmerge cells'
			},
			{
				html: '<table><tr><td rowspan="3">a</td><td>b</td><td>c</td></tr></table>',
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 21 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 1,
					toRow: 2
				},
				method: 'mergeCells',
				expectedData: ( data ) => {
					data[ 3 ].attributes.colspan = 1;
					data[ 3 ].attributes.rowspan = 1;
					data.splice( 8, 5 );
				},
				msg: 'unmerge cell with excessive rowspan'
			},
			{
				html: '<table><tr><td rowspan="3">a</td><td>b</td><td>c</td></tr></table>',
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 21 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 2
				},
				method: 'mergeCells',
				expectedData: ( data ) => {
					data[ 3 ].attributes.colspan = 1;
					data[ 3 ].attributes.rowspan = 1;
				},
				msg: 'merge cell with excessive rowspan'
			},
			{
				html: ve.dm.example.mergedCellsHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 5,
					toRow: 5
				},
				method: 'mergeCells',
				args: [],
				expectedData: ( data ) => {
					data[ 3 ].attributes.colspan = 6;
					data[ 3 ].attributes.rowspan = 1;
					data.splice( 8, 122 );
				},
				msg: 'merge full rows'
			},
			{
				html: ve.dm.example.mergedCellsHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 3,
					toRow: 6
				},
				method: 'mergeCells',
				args: [],
				expectedData: ( data ) => {
					data[ 3 ].attributes.colspan = 1;
					data[ 3 ].attributes.rowspan = 7;
					data.splice( 132, 24 );
					data.splice( 118, 6 );
					data.splice( 104, 6 );
					data.splice( 84, 12 );
					data.splice( 58, 18 );
					data.splice( 35, 10 );
					data.splice( 8, 15 );
				},
				msg: 'merge full columns'
			},
			{
				html: '<table><tr><td></td><td>A</td></tr><tr><td></td><td></td></tr></table>',
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 25 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 1,
					toRow: 0
				},
				method: 'mergeCells',
				args: [],
				expectedData: ( data ) => {
					data.splice( 3, 4 );
					data[ 3 ].attributes.colspan = 2;
					data[ 3 ].attributes.rowspan = 1;
				},
				msg: 'merge when first cell is empty'
			},
			{
				html: ve.dm.example.mergedCellsHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				},
				method: 'delete',
				args: [ 'table' ],
				expectedData: ( data ) => {
					data.splice( 0, 171,
						{ type: 'paragraph' },
						{ type: '/paragraph' }
					);
				},
				msg: 'delete whole table'
			},
			{
				html: ve.dm.example.mergedCellsHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 0,
					fromRow: 3,
					toCol: 0,
					toRow: 3
				},
				method: 'delete',
				args: [ 'row' ],
				expectedData: ( data ) => {
					data[ 90 ].attributes.rowspan = 2;
					data[ 45 ].attributes.rowspan = 3;
					data.splice(
						110,
						0,
						{
							type: 'tableCell',
							attributes: {
								colspan: 3,
								rowspan: 2,
								style: 'data'
							}
						},
						{ type: 'paragraph', internal: { generated: 'wrapper' } },
						...'16',
						{ type: '/paragraph' },
						{ type: '/tableCell' }
					);
					data.splice( 83, 20 );
				},
				expectedRangeOrSelection: { type: 'null' },
				msg: 'delete row'
			},
			{
				html: ve.dm.example.mergedCellsHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 3,
					fromRow: 0,
					toCol: 3,
					toRow: 0
				},
				method: 'delete',
				args: [ 'col' ],
				expectedData: ( data ) => {
					data[ 90 ].attributes.colspan = 2;
					data.splice( 150, 6 );
					data.splice( 18, 5 );
				},
				expectedRangeOrSelection: { type: 'null' },
				msg: 'delete column'
			},
			{
				html: ve.dm.example.mergedCellsHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 171 ),
					fromCol: 1,
					fromRow: 0,
					toCol: 2,
					toRow: 1
				},
				method: 'changeCellStyle',
				args: [ 'header' ],
				expectedData: ( data ) => {
					data[ 8 ].attributes.style = 'header';
					data[ 13 ].attributes.style = 'header';
					data[ 40 ].attributes.style = 'header';
				},
				msg: 'change style to header'
			},
			{
				html: ve.dm.example.annotatedTableHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 52 ),
					fromCol: 0,
					fromRow: 1,
					toCol: 0,
					toRow: 1
				},
				method: 'moveRelative',
				args: [ 'row', 'before' ],
				expectedData: ( data ) => {
					const row = data.splice( 25, 25 );
					data.splice( 2, 0, ...row );
				},
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 52 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				},
				msg: 'move row before'
			},
			{
				html: ve.dm.example.annotatedTableHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 52 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				},
				method: 'moveRelative',
				args: [ 'row', 'after' ],
				expectedData: ( data ) => {
					const row = data.splice( 25, 25 );
					data.splice( 2, 0, ...row );
				},
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 52 ),
					fromCol: 0,
					fromRow: 1,
					toCol: 0,
					toRow: 1
				},
				msg: 'move row after'
			},
			{
				html: ve.dm.example.annotatedTableHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 52 ),
					fromCol: 1,
					fromRow: 0,
					toCol: 1,
					toRow: 0
				},
				method: 'moveRelative',
				args: [ 'col', 'before' ],
				expectedData: ( data ) => {
					const cell2 = data.splice( 34, 8 ),
						cell1 = data.splice( 10, 7 );

					data.splice( 26 - cell1.length, 0, ...cell2 );
					data.splice( 3, 0, ...cell1 );
				},
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 52 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				},
				msg: 'move column before'
			},
			{
				html: ve.dm.example.annotatedTableHtml,
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 52 ),
					fromCol: 0,
					fromRow: 0,
					toCol: 0,
					toRow: 0
				},
				method: 'moveRelative',
				args: [ 'col', 'after' ],
				expectedData: ( data ) => {
					const cell2 = data.splice( 26, 8 ),
						cell1 = data.splice( 3, 7 );

					data.splice( 42 - cell1.length - cell2.length, 0, ...cell2 );
					data.splice( 17 - cell1.length, 0, ...cell1 );
				},
				expectedRangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 52 ),
					fromCol: 1,
					fromRow: 0,
					toCol: 1,
					toRow: 0
				},
				msg: 'move column after'
			},
			{
				html: '<table><tr></tr><tr><td>A</td></tr></table>',
				rangeOrSelection: {
					type: 'table',
					tableRange: new ve.Range( 0, 13 ),
					fromCol: 0,
					fromRow: 1,
					toCol: 0,
					toRow: 1
				},
				method: 'moveRelative',
				args: [ 'row', 'before' ],
				expectedData: ( data ) => {
					const row = data.splice( 4, 7 );
					data.splice( 2, 0, ...row );
				},
				msg: 'move row adjacent to sparse row'
			}
		];

	cases.forEach( ( caseItem ) => {
		ve.test.utils.runActionTest(
			assert,
			{
				actionName: 'table',
				createView: true,
				...caseItem
			}
		);
	} );
} );
