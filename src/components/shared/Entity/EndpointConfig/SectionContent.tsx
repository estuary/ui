import type { SectionContentProps } from 'src/components/shared/Entity/EndpointConfig/types';

import { useEffect, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import { isEqual } from 'lodash';
import { useIntl } from 'react-intl';
import { useMount, useUnmount } from 'react-use';

import AlertBox from 'src/components/shared/AlertBox';
import EndpointConfigForm from 'src/components/shared/Entity/EndpointConfig/Form';
import { DOCUSAURUS_THEME } from 'src/components/shared/Entity/EndpointConfig/shared';
import Error from 'src/components/shared/Error';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import useConnectorTag from 'src/hooks/connectors/useConnectorTag';
import {
    useEndpointConfig_setServerUpdateRequired,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_previousEndpointConfig_data,
} from 'src/stores/EndpointConfig/hooks';
import { useEndpointConfigStore } from 'src/stores/EndpointConfig/Store';
import { useSidePanelDocsStore } from 'src/stores/SidePanelDocs/Store';

const SectionContent = ({
    connectorImage,
    readOnly = false,
}: SectionContentProps) => {
    // General hooks
    const intl = useIntl();
    const theme = useTheme();

    // The useConnectorTag hook can accept a connector ID or a connector tag ID.
    const { connectorTag, error } = useConnectorTag(connectorImage);

    // Endpoint Config Store
    const endpointCanBeEmpty = useEndpointConfigStore(
        (state) => state.endpointCanBeEmpty
    );
    const endpointConfig = useEndpointConfigStore_endpointConfig_data();
    const previousEndpointConfig =
        useEndpointConfigStore_previousEndpointConfig_data();
    const setServerUpdateRequired = useEndpointConfig_setServerUpdateRequired();

    // Workflow related props
    const editWorkflow = useEntityWorkflow_Editing();

    // Controlling if we need to show the generate button again
    const endpointConfigUpdated = useMemo(() => {
        return endpointCanBeEmpty
            ? false
            : !isEqual(endpointConfig, previousEndpointConfig);
    }, [endpointCanBeEmpty, endpointConfig, previousEndpointConfig]);

    useEffect(() => {
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
        if (connectorTag) {
            const concatSymbol = connectorTag.documentation_url.includes('?')
                ? '&'
                : '?';

            setDocsURL(
                `${connectorTag.documentation_url}${concatSymbol}${DOCUSAURUS_THEME}=${theme.palette.mode}`
            );
        }

        // We do not want to trigger this if the theme changes so we just use the theme at load
        //  because we fire a message to the docs when the theme changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectorTag, setDocsURL]);

    // Default serverUpdateRequired for Create
    //  This prevents us from sending the empty object to get encrypted
    //  Handles an edgecase where the user submits the endpoint config
    //      with all the default properties (hello world).
    useMount(() => {
        if (!editWorkflow) {
            setServerUpdateRequired(true);
        }
    });

    if (error) {
        return <Error error={error} />;
    }

    if (!connectorTag) {
        return null;
    }

    return (
        <ErrorBoundryWrapper>
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
