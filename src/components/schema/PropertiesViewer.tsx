import type { MonacoEditorProps } from 'src/components/editor/MonacoEditor';
import type { FieldFilter } from 'src/components/schema/types';

import { useState } from 'react';

import { Box, Collapse, Grid, Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import {
    useBindingsEditorStore_inferSchemaResponseEmpty,
    useBindingsEditorStore_inferSchemaResponseError,
} from 'src/components/editor/Bindings/Store/hooks';
import MonacoEditor from 'src/components/editor/MonacoEditor';
import ExistFilter from 'src/components/schema/ExistFilter';
import AlertBox from 'src/components/shared/AlertBox';
import SchemaPropertiesTable from 'src/components/tables/Schema';
import { optionalColumns } from 'src/components/tables/Schema/shared';
import TableColumnSelector from 'src/components/tables/TableColumnSelector';
import { useEntityWorkflow } from 'src/context/Workflow';
import { TablePrefixes } from 'src/stores/Tables/hooks';

interface Props {
    disabled: boolean;
    editorProps?: Partial<MonacoEditorProps>;
}

const EDITOR_HEIGHT = 404;

function PropertiesViewer({ disabled, editorProps }: Props) {
    const workflow = useEntityWorkflow();
    const isCaptureWorkflow =
        workflow === 'capture_create' || workflow === 'capture_edit';

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
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center' }}
                    >
                        <Box style={{ width: 150 }}>
                            <ExistFilter
                                fieldFilter={fieldFilter}
                                setFieldFilter={setFieldFilter}
                                disabled={inferSchemaResponseEmpty}
                            />
                        </Box>

                        {isCaptureWorkflow ? (
                            <TableColumnSelector
                                optionalColumns={optionalColumns}
                                tablePrefix={TablePrefixes.schemaViewer}
                            />
                        ) : null}
                    </Stack>
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
