import { Box, Grid, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import SchemaPropertiesTable from 'components/tables/Schema';

interface Props {
    inferredSchema: any;
}

const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 100 },
    { field: 'pointer', headerName: 'JSON Pointer', width: 225 },
    { field: 'types', headerName: 'Types', width: 150 },
    { field: 'exists', headerName: 'Exists' },
    // { field: 'reduction', headerName: 'Reduction' },
    // {
    //     field: 'is_pattern_property',
    //     headerName: 'Pattern Property',
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
                <SchemaPropertiesTable inferredSchema={inferredSchema} />
            </Box>
        </Grid>
    );
}

export default PropertiesViewer;
