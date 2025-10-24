import type {
    FieldFilter,
    PropertiesViewerProps,
} from 'src/components/schema/types';

import { useState } from 'react';

import { Box, Grid, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { useBindingsEditorStore_skimProjectionResponseEmpty } from 'src/components/editor/Bindings/Store/hooks';
import MonacoEditor from 'src/components/editor/MonacoEditor';
import ExistFilter from 'src/components/schema/ExistFilter';
import SchemaSelector from 'src/components/schema/SchemaSelector';
import SchemaPropertiesTable from 'src/components/tables/Schema';
import { optionalColumns } from 'src/components/tables/Schema/shared';
import TableColumnSelector from 'src/components/tables/TableColumnSelector';
import { useEntityWorkflow } from 'src/context/Workflow';
import { TablePrefixes } from 'src/stores/Tables/hooks';

const EDITOR_HEIGHT = 404;

function PropertiesViewer({ disabled, editorProps }: PropertiesViewerProps) {
    const intl = useIntl();

    const workflow = useEntityWorkflow();
    const isCaptureWorkflow =
        workflow === 'capture_create' || workflow === 'capture_edit';

    const skimProjectionResponseEmpty =
        useBindingsEditorStore_skimProjectionResponseEmpty();

    const [fieldFilter, setFieldFilter] = useState<FieldFilter>('all');

    return (
        <Grid item xs={12}>
            <Stack
                sx={{
                    justifyContent: 'space-between',
                }}
                spacing={2}
                direction="row"
            >
                <Stack direction="row" spacing={1}>
                    <Typography variant="subtitle1" component="span">
                        {intl.formatMessage({
                            id: 'schemaEditor.fields.label',
                        })}
                    </Typography>
                    <SchemaSelector />
                </Stack>

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
                                disabled={skimProjectionResponseEmpty}
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
