import { Box, Grid, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface Props {
    inferredSchema: any;
}

const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 100 },
    { field: 'pointer', headerName: 'JSON Pointer', width: 225 },
    { field: 'types', headerName: 'Types', width: 150 },
    { field: 'exists', headerName: 'Exists' },
    { field: 'reduction', headerName: 'Reduction' },
    {
        field: 'is_pattern_property',
        headerName: 'Pattern Property',
    },

    // {
    //     field: 'fullName',
    //     headerName: 'Full name',
    //     description: 'This column has a value getter and is not sortable.',
    //     sortable: false,
    //     width: 160,
    //     valueGetter: (params: GridValueGetterParams) =>
    //         `${params.row.firstName || ''} ${params.row.lastName || ''}`,
    // },
];

function PropertiesViewer({ inferredSchema }: Props) {
    console.log('inferredSchema', inferredSchema);
    return (
        <Grid item xs={12}>
            <Box sx={{ height: 400, width: '100%' }}>
                <Typography variant="h5" component="span">
                    Fields
                </Typography>
                <DataGrid
                    rows={inferredSchema}
                    columns={columns}
                    getRowId={(row) => row.pointer}
                />
            </Box>
        </Grid>
    );
}

export default PropertiesViewer;
