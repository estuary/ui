import { Box, Collapse, Grid, Typography } from '@mui/material';
import {
    useBindingsEditorStore_inferSchemaDoneProcessing,
    useBindingsEditorStore_inferSchemaError,
    useBindingsEditorStore_inferSchemaResponse,
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
    const inferSchemaError = useBindingsEditorStore_inferSchemaError();
    const inferSchemaResponse = useBindingsEditorStore_inferSchemaResponse();
    const inferSchemaDoneProcessing =
        useBindingsEditorStore_inferSchemaDoneProcessing();

    const noInferSchema = Boolean(
        inferSchemaDoneProcessing && inferSchemaError
    );

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
                in={noInferSchema}
                sx={{
                    mb: noInferSchema ? 2 : undefined,
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
