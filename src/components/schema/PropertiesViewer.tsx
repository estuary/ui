import type { FieldFilter } from 'src/components/schema/types';

import { useState } from 'react';

import { Box, Collapse, Grid, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import {
    useBindingsEditorStore_skimProjectionResponseEmpty,
    useBindingsEditorStore_skimProjectionResponseError,
} from 'src/components/editor/Bindings/Store/hooks';
import ExistFilter from 'src/components/schema/ExistFilter';
import AlertBox from 'src/components/shared/AlertBox';
import SchemaPropertiesTable from 'src/components/tables/Schema';
import { optionalColumns } from 'src/components/tables/Schema/shared';
import TableColumnSelector from 'src/components/tables/TableColumnSelector';
import { useEntityWorkflow } from 'src/context/Workflow';
import { TablePrefixes } from 'src/stores/Tables/hooks';

function PropertiesViewer() {
    const intl = useIntl();

    const workflow = useEntityWorkflow();
    const isCaptureWorkflow =
        workflow === 'capture_create' || workflow === 'capture_edit';

    const skimProjectionResponseError =
        useBindingsEditorStore_skimProjectionResponseError();
    const skimProjectionResponseEmpty =
        useBindingsEditorStore_skimProjectionResponseEmpty();

    const [fieldFilter, setFieldFilter] = useState<FieldFilter>('ALL');

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
                    {intl.formatMessage({ id: 'schemaEditor.fields.label' })}
                </Typography>

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
            </Stack>

            <Collapse
                in={skimProjectionResponseEmpty}
                sx={{
                    mt: 2,
                    mb: skimProjectionResponseEmpty ? 2 : undefined,
                }}
            >
                <AlertBox
                    short
                    severity="error"
                    title={intl.formatMessage({
                        id: 'schemaEditor.error.title',
                    })}
                >
                    {skimProjectionResponseError}
                </AlertBox>
            </Collapse>

            <Box style={{ width: '100%' }}>
                <SchemaPropertiesTable filter={fieldFilter} />
            </Box>
        </Grid>
    );
}

export default PropertiesViewer;
