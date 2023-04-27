import { Box, Grid, Typography } from '@mui/material';
import SchemaPropertiesTable from 'components/tables/Schema';
import { FormattedMessage } from 'react-intl';
import Editor from './Editor';

interface Props {
    inferSchemaResponse: any;
    disabled: boolean;
    entityName: string;
}

const EDITOR_HEIGHT = 404;

function PropertiesViewer({
    disabled,
    entityName,
    inferSchemaResponse,
}: Props) {
    return (
        <Grid
            item
            xs={12}
            sx={{
                mt: 2,
            }}
        >
            <Typography variant="subtitle1" component="span">
                <FormattedMessage id="data.fields.label" />
            </Typography>
            {disabled ? (
                <Box sx={{ height: 400, width: '100%', overflowY: 'auto' }}>
                    <SchemaPropertiesTable
                        inferSchemaResponse={inferSchemaResponse}
                    />
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
