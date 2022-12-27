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
        { field: 'name', headerName: 'Field Name', resizable: true, flex: 1 },
        {
            field: 'pointer',
            headerName: 'JSON Location',
            resizable: true,
            flex: 1,
        },
        { field: 'types', headerName: 'Type(s)', resizable: true, flex: 1 },
        {
            field: 'reduction',
            headerName: 'Reduction Strategy',
            resizable: true,
            flex: 1,
        },
        {
            field: 'description',
            headerName: 'Description',
            resizable: true,
            flex: 2,
            valueGetter: (params: GridValueGetterParams) => {
                const row = params.row;
                if (row.title && row.description) {
                    return `${row.title} - ${row.description}`;
                } else if (row.title) {
                    return row.title;
                } else {
                    return row.description;
                }
            },
        },
        {
            field: 'is_pattern_property',
            headerName: 'Is pattern property',
            flex: 1,
        },
        { field: 'exists', headerName: 'Exists', flex: 1 },
        { field: 'enum_vals', headerName: 'Constant value(s)', flex: 1 },
        { field: 'string_format', headerName: 'String format', flex: 1 },
    ];
    try {
        const inferredProperties = flowWeb.infer(schema);
        const rowId = (row: any) => {
            return row.pointer;
        };
        console.log('Got inferred properties AH', inferredProperties);
        return (
            <Box>
                <DataGrid
                    columns={columns}
                    rows={inferredProperties}
                    autoHeight={true}
                    headerHeight={40}
                    rowCount={inferredProperties.length}
                    getRowId={rowId}
                    disableColumnSelector
                />
            </Box>
        );
    } catch (err) {
        console.log('inferrence error', err);
        return <Error error={err} />;
    }
}

export default InferredProperties;
