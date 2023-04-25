import { Box, Grid, Typography } from '@mui/material';
import SchemaPropertiesTable from 'components/tables/Schema';
import { FormattedMessage } from 'react-intl';

interface Props {
    inferredSchema: any;
}

function PropertiesViewer({ inferredSchema }: Props) {
    console.log('inferredSchema', inferredSchema);
    return (
        <Grid item xs={12}>
            <Box sx={{ height: 400, width: '100%', overflowY: 'auto' }}>
                <Typography variant="subtitle1" component="span">
                    <FormattedMessage id="data.fields.label" />
                </Typography>
                <SchemaPropertiesTable inferredSchema={inferredSchema} />
            </Box>
        </Grid>
    );
}

export default PropertiesViewer;
