import { Box, Grid, Typography } from '@mui/material';
import MonacoEditor, {
    MonacoEditorProps,
} from 'components/editor/MonacoEditor';
import SchemaPropertiesTable from 'components/tables/Schema';
import { FormattedMessage } from 'react-intl';

interface Props {
    inferSchemaResponse: any;
    disabled: boolean;
    editorProps?: Partial<MonacoEditorProps>;
}

const EDITOR_HEIGHT = 404;

function PropertiesViewer({
    disabled,
    inferSchemaResponse,
    editorProps,
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
                <FormattedMessage id="schemaEditor.fields.label" />
            </Typography>

            {disabled ? (
                <Box sx={{ height: 400, width: '100%', overflowY: 'auto' }}>
                    <SchemaPropertiesTable
                        inferSchemaResponse={inferSchemaResponse}
                    />
                </Box>
            ) : (
                <MonacoEditor
                    localZustandScope
                    height={EDITOR_HEIGHT}
                    {...editorProps}
                />
            )}
        </Grid>
    );
}

export default PropertiesViewer;
