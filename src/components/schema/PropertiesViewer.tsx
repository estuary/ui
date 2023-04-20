import { Box, Grid, Typography } from '@mui/material';
import SchemaPropertiesTable from 'components/tables/Schema';

interface Props {
    inferredSchema: any;
}

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
