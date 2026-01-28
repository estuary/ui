import type { SectionContentProps } from 'src/components/shared/Entity/EndpointConfig/types';

import { useEffect, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import { isEqual } from 'lodash';
import { useIntl } from 'react-intl';
import { useMount, useUnmount } from 'react-use';

import AlertBox from 'src/components/shared/AlertBox';
import EndpointConfigForm from 'src/components/shared/Entity/EndpointConfig/Form';
import { DOCUSAURUS_THEME } from 'src/components/shared/Entity/EndpointConfig/shared';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import HydrationError from 'src/components/shared/HydrationError';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { logRocketEvent } from 'src/services/shared';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfig_setServerUpdateRequired,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_previousEndpointConfig_data,
} from 'src/stores/EndpointConfig/hooks';
import { useEndpointConfigStore } from 'src/stores/EndpointConfig/Store';
import { useSidePanelDocsStore } from 'src/stores/SidePanelDocs/Store';
import { useWorkflowStore_connectorTagProperty } from 'src/stores/Workflow/hooks';

const SectionContent = ({ readOnly = false }: SectionContentProps) => {
    // General hooks
    const intl = useIntl();
    const theme = useTheme();

    // Detail Form Store
    const [connectorId, connectorTagId] = useDetailsFormStore((state) => [
        state.details.data.connectorImage.connectorId,
        state.details.data.connectorImage.id,
    ]);

    // Endpoint Config Store
    const [endpointCanBeEmpty, hydrationErrorsExist] = useEndpointConfigStore(
        (state) => [state.endpointCanBeEmpty, state.hydrationErrorsExist]
    );
    const endpointConfig = useEndpointConfigStore_endpointConfig_data();
    const previousEndpointConfig =
        useEndpointConfigStore_previousEndpointConfig_data();
    const setServerUpdateRequired = useEndpointConfig_setServerUpdateRequired();

    // Workflow Store
    const documentationURL = useWorkflowStore_connectorTagProperty(
        connectorId,
        connectorTagId,
        'documentation_url'
    );

    // Workflow related props
    const editWorkflow = useEntityWorkflow_Editing();

    // Controlling if we need to show the generate button again
    const endpointConfigUpdated = useMemo(() => {
        const response = endpointCanBeEmpty
            ? false
            : !isEqual(endpointConfig, previousEndpointConfig);

        logRocketEvent('EndpointConfig', {
            configCompare: true,
            response,
            endpointCanBeEmpty,
        });

        return response;
    }, [endpointCanBeEmpty, endpointConfig, previousEndpointConfig]);

    useEffect(() => {
        logRocketEvent('EndpointConfig', {
            setUpdateRequired: true,
            endpointConfigUpdated,
        });
        setServerUpdateRequired(endpointConfigUpdated);
    }, [setServerUpdateRequired, endpointConfigUpdated]);

    // Populating/handling the side panel docs url
    const [setDocsURL, sidePanelResetState] = useSidePanelDocsStore((state) => [
        state.setUrl,
        state.resetState,
    ]);
    useUnmount(() => {
        sidePanelResetState();
    });
    useEffect(() => {
        if (documentationURL) {
            const concatSymbol = documentationURL.includes('?') ? '&' : '?';

            setDocsURL(
                `${documentationURL}${concatSymbol}${DOCUSAURUS_THEME}=${theme.palette.mode}`
            );
        }

        // We do not want to trigger this if the theme changes so we just use the theme at load
        //  because we fire a message to the docs when the theme changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documentationURL, setDocsURL]);

    // Default serverUpdateRequired for Create
    //  This prevents us from sending the empty object to get encrypted
    //  Handles an edgecase where the user submits the endpoint config
    //      with all the default properties (hello world).
    useMount(() => {
        if (!editWorkflow) {
            setServerUpdateRequired(true);
        }
    });

    return (
        <ErrorBoundryWrapper>
            {hydrationErrorsExist ? <HydrationError /> : null}

            {readOnly ? (
                <Box sx={{ mb: 3 }}>
                    <AlertBox severity="info" short>
                        {intl.formatMessage({
                            id: 'entityEdit.alert.endpointConfigDisabled',
                        })}
                    </AlertBox>
                </Box>
            ) : null}

            {endpointCanBeEmpty ? (
                <Box sx={{ mb: 3 }}>
                    <AlertBox severity="info" short>
                        {intl.formatMessage({
                            id: 'workflows.alert.endpointConfigEmpty',
                        })}
                    </AlertBox>
                </Box>
            ) : null}

            <EndpointConfigForm readOnly={readOnly} />
        </ErrorBoundryWrapper>
    );
};

export default SectionContent;
