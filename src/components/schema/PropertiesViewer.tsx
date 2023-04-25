import { Box, Grid, Typography } from '@mui/material';
import SchemaPropertiesTable from 'components/tables/Schema';
import { FormattedMessage } from 'react-intl';
import Editor from './Editor';

interface Props {
    inferredSchema: any;
    disabled: boolean;
    entityName: string;
}

const EDITOR_HEIGHT = 404;

function PropertiesViewer({ disabled, entityName, inferredSchema }: Props) {
    console.log('inferredSchema', inferredSchema);

    return (
        <Grid item xs={12}>
            <Typography variant="subtitle1" component="span">
                <FormattedMessage id="data.fields.label" />
            </Typography>
            {disabled ? (
                <Box sx={{ height: 400, width: '100%', overflowY: 'auto' }}>
                    <SchemaPropertiesTable inferredSchema={inferredSchema} />
                </Box>
            ) : (
                <Editor
                    entityType="collection"
                    localZustandScope={true}
                    editorHeight={EDITOR_HEIGHT}
                    entityName={entityName}
                />
            )}
        </Grid>
    );
}

export default PropertiesViewer;
