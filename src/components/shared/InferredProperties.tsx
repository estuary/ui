import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
//import ListAndDetails from 'components/editor/ListAndDetails';
import Box from '@mui/material/Box';
import Error from 'components/shared/Error';
import * as flowWeb from 'flow-web';

interface SchemaInferenceProps {
	schema: any;
}

/*
{ "type": "object", "properties": {"foo": {"type": "integer"}, "bar": {"type": "string"}}}
*/

function InferredProperties({ schema }: SchemaInferenceProps) {
	const columns: GridColDef[] = [
				{ field: 'name', headerName: 'Field Name', flex: 1 },
				{ field: 'pointer', headerName: 'JSON Location', flex: 1 },
				{ field: 'types', headerName: 'Type(s)', flex: 1 },
				{ field: 'reduction', headerName: 'Reduction Strategy', flex: 1 },
				{ field: 'description', headerName: 'Description', flex: 2, valueGetter: (params: GridValueGetterParams) => {
						const row = params.row;
						if (row.title && row.description) {
							return `${row.title} - ${row.description}`
						} else if (row.title) {
							return row.title
						} else {
							return row.description
						}
				}},
	];
	try {
		const inferredProperties = flowWeb.infer(schema);
		const rowId = (row: any) => {
			return row.pointer
		};
		// const rows = inferredProperties.map((p: any) => {
		// 	return {
		// 		id: p.pointer,
		// 		name: p.name,
		// 		pointer: p.pointer,
		// 		types: p.types.join('|')
		// 	};
		// })
		console.log("Got inferred properties AH", inferredProperties);
		return (
			<Box>
			<DataGrid
				columns={ columns }
				rows={ inferredProperties }
			  autoHeight={ true }
        headerHeight={40}
        rowCount={ inferredProperties.length }
				getRowId={ rowId }
        disableColumnSelector
			/>
		  </Box>
		);
	} catch (err) {
		return ( <Error error={err} /> );
	}
}

export default InferredProperties;
