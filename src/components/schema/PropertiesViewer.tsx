import type { MonacoEditorProps } from 'components/editor/MonacoEditor';
import type { FieldFilter } from './types';
import { Box, Collapse, Grid, Stack, Typography } from '@mui/material';
import {
    useBindingsEditorStore_inferSchemaResponseEmpty,
    useBindingsEditorStore_inferSchemaResponseError,
} from 'components/editor/Bindings/Store/hooks';
import MonacoEditor from 'components/editor/MonacoEditor';
import AlertBox from 'components/shared/AlertBox';
import SchemaPropertiesTable from 'components/tables/Schema';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ExistFilter from './ExistFilter';

interface Props {
    disabled: boolean;
    editorProps?: Partial<MonacoEditorProps>;
}

const EDITOR_HEIGHT = 404;

function PropertiesViewer({ disabled, editorProps }: Props) {
    const inferSchemaError = useBindingsEditorStore_inferSchemaResponseError();
    const inferSchemaResponseEmpty =
        useBindingsEditorStore_inferSchemaResponseEmpty();

    const [fieldFilter, setFieldFilter] = useState<FieldFilter>('all');

    return (
        <Grid
            item
            xs={12}
            sx={{
                mt: 2,
            }}
        >
            <Stack
                style={{ justifyContent: 'space-between' }}
                spacing={2}
                direction="row"
            >
                <Typography variant="subtitle1" component="span">
                    <FormattedMessage id="schemaEditor.fields.label" />
                </Typography>

                {disabled ? (
                    <Box style={{ width: 150 }}>
                        <ExistFilter
                            fieldFilter={fieldFilter}
                            setFieldFilter={setFieldFilter}
                            disabled={inferSchemaResponseEmpty}
                        />
                    </Box>
                ) : null}
            </Stack>

            <Collapse
                in={inferSchemaResponseEmpty}
                sx={{
                    mt: 2,
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
                <Box style={{ width: '100%' }}>
                    <SchemaPropertiesTable filter={fieldFilter} />
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
