import { Box, Collapse, Grid, Typography } from '@mui/material';
import {
    useBindingsEditorStore_inferSchemaResponseEmpty,
    useBindingsEditorStore_inferSchemaResponseError,
} from 'components/editor/Bindings/Store/hooks';
import MonacoEditor, {
    MonacoEditorProps,
} from 'components/editor/MonacoEditor';
import AlertBox from 'components/shared/AlertBox';
import SchemaPropertiesTable from 'components/tables/Schema';
import { FormattedMessage } from 'react-intl';

interface Props {
    disabled: boolean;
    editorProps?: Partial<MonacoEditorProps>;
}

const EDITOR_HEIGHT = 404;

function PropertiesViewer({ disabled, editorProps }: Props) {
    const inferSchemaError = useBindingsEditorStore_inferSchemaResponseError();
    const inferSchemaResponseEmpty =
        useBindingsEditorStore_inferSchemaResponseEmpty();

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

            <Collapse
                in={inferSchemaResponseEmpty}
                sx={{
                    mb: inferSchemaResponseEmpty ? 2 : undefined,
                }}
            >
                <AlertBox
                    short
                    severity="error"
                    title={<FormattedMessage id="schemaEditor.error.title" />}
                >
                    {inferSchemaError}
                </AlertBox>
            </Collapse>

            {disabled ? (
                <Box sx={{ width: '100%' }}>
                    <SchemaPropertiesTable />
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
