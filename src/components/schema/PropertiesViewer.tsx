import { useState } from 'react';

import { Box, Collapse, Grid, Stack, Typography } from '@mui/material';

import ExistFilter from './ExistFilter';
import { FieldFilter } from './types';
import { FormattedMessage } from 'react-intl';

import {
    useBindingsEditorStore_inferSchemaResponseEmpty,
    useBindingsEditorStore_inferSchemaResponseError,
} from 'src/components/editor/Bindings/Store/hooks';
import MonacoEditor, {
    MonacoEditorProps,
} from 'src/components/editor/MonacoEditor';
import AlertBox from 'src/components/shared/AlertBox';
import SchemaPropertiesTable from 'src/components/tables/Schema';

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
