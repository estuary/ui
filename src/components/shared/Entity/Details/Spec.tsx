import { useEffect, useMemo } from 'react';

import { FormattedMessage } from 'react-intl';

import { Grid, Stack, Typography } from '@mui/material';

import {
    useBindingsEditorStore_inferSchemaResponseDoneProcessing,
    useBindingsEditorStore_populateInferSchemaResponse,
    useBindingsEditorStore_resetState,
} from 'components/editor/Bindings/Store/hooks';
import LiveSpecEditor from 'components/editor/LiveSpec';
import { useEditorStore_currentCatalog } from 'components/editor/Store/hooks';
import ReadOnly from 'components/schema/KeyAutoComplete/ReadOnly';
import PropertiesViewer from 'components/schema/PropertiesViewer';
import ExternalLink from 'components/shared/ExternalLink';

import { useEntityType } from 'context/EntityContext';

function Spec() {
    const entityType = useEntityType();

    const currentCatalog = useEditorStore_currentCatalog({
        localScope: true,
    });

    const resetState = useBindingsEditorStore_resetState();

    const populateInferSchemaResponse =
        useBindingsEditorStore_populateInferSchemaResponse();

    const inferSchemaResponseDoneProcessing =
        useBindingsEditorStore_inferSchemaResponseDoneProcessing();

    useEffect(() => {
        if (entityType === 'collection' && currentCatalog) {
            populateInferSchemaResponse(currentCatalog.spec);
        }

        return () => {
            resetState();
        };
    }, [currentCatalog, entityType, populateInferSchemaResponse, resetState]);

    const docsLink = useMemo(() => {
        switch (entityType) {
            case 'capture':
                return 'https://docs.estuary.dev/concepts/captures/#specification';
            case 'materialization':
                return 'https://docs.estuary.dev/concepts/materialization/#specification';
            default:
                return 'https://docs.estuary.dev/concepts/collections/#specification';
        }
    }, [entityType]);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Stack spacing={2} sx={{ m: 2 }}>
                    <Stack direction="row" spacing={1}>
                        <Typography
                            component="span"
                            variant="h6"
                            sx={{
                                alignItems: 'center',
                            }}
                        >
                            <FormattedMessage id="detailsPanel.specification.header" />
                        </Typography>
                        <ExternalLink link={docsLink}>
                            <FormattedMessage id="terms.documentation" />
                        </ExternalLink>
                    </Stack>
                    {inferSchemaResponseDoneProcessing ? (
                        <>
                            <ReadOnly value={currentCatalog?.spec.key} />
                            <PropertiesViewer disabled />
                        </>
                    ) : (
                        <LiveSpecEditor localZustandScope singleSpec />
                    )}
                </Stack>
            </Grid>
        </Grid>
    );
}

export default Spec;
