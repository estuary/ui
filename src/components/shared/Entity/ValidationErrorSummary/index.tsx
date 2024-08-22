import { AlertTitle, Collapse } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import DetailsErrors from 'components/shared/Entity/ValidationErrorSummary/DetailsErrors';
import EndpointConfigErrors from 'components/shared/Entity/ValidationErrorSummary/EndpointConfigErrors';
import NoConnectorError from 'components/shared/Entity/ValidationErrorSummary/NoConnectorError';
import ResourceConfigErrors from 'components/shared/Entity/ValidationErrorSummary/ResourceConfigErrors';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useScrollIntoView from 'hooks/useScrollIntoView';
import { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useBinding_fullSourceErrorsExist,
    useBinding_hydrationErrorsExist,
    useBinding_resourceConfigErrorsExist,
} from 'stores/Binding/hooks';
import { useConnectorStore } from 'stores/Connector/Store';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import {
    useEndpointConfigStore_errorsExist,
    useEndpointConfig_hydrationErrorsExist,
} from 'stores/EndpointConfig/hooks';
import { useFormStateStore_displayValidation } from 'stores/FormState/hooks';
import { hasLength } from 'utils/misc-utils';
import ConnectorDetailsMissing from './ConnectorDetailsMissing';

interface Props {
    ErrorComponent?: any | boolean;
    hideIcon?: boolean;
    headerMessageId?: string;
}

function ValidationErrorSummary({
    headerMessageId,
    hideIcon,
    ErrorComponent,
}: Props) {
    const scrollToTarget = useRef<HTMLDivElement>(null);
    const scrollIntoView = useScrollIntoView(scrollToTarget);

    const connectorID = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    // Binding Store
    const bindingHydrationErrorsExist = useBinding_hydrationErrorsExist();
    const resourceConfigErrorsExist = useBinding_resourceConfigErrorsExist();
    const fullSourceErrorsExist = useBinding_fullSourceErrorsExist();

    // Details form
    const detailsFormErrorsExist = useDetailsFormStore(
        (state) => state.errorsExist
    );

    // Endpoint Config Store
    const endpointConfigHydrationErrorsExist =
        useEndpointConfig_hydrationErrorsExist();

    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();

    // Connector Store

    const connectorHydrationErrorsExist = useConnectorStore(
        (state) => state.hydrationErrorsExist
    );

    // Form State Store
    const displayValidation = useFormStateStore_displayValidation();

    const hydrationErrorsExist =
        endpointConfigHydrationErrorsExist ||
        bindingHydrationErrorsExist ||
        connectorHydrationErrorsExist;

    console.log('connectorHydrationErrorsExist', connectorHydrationErrorsExist);

    const formErrorsExist =
        detailsFormErrorsExist ||
        endpointConfigErrorsExist ||
        resourceConfigErrorsExist ||
        fullSourceErrorsExist;

    const defaultHeaderMessageId = hydrationErrorsExist
        ? 'workflows.error.initForm'
        : 'entityCreate.endpointConfig.errorSummary';

    const show = displayValidation || hydrationErrorsExist;

    useEffect(() => {
        if (show) {
            scrollIntoView(scrollToTarget);
        }
    }, [show, scrollIntoView]);

    return show ? (
        <Collapse in={formErrorsExist} timeout="auto" unmountOnExit>
            <AlertBox severity="error" hideIcon={hideIcon} ref={scrollToTarget}>
                <AlertTitle>
                    <FormattedMessage
                        id={headerMessageId ?? defaultHeaderMessageId}
                    />
                </AlertTitle>

                {ErrorComponent === false ? null : ErrorComponent ? (
                    <ErrorComponent />
                ) : connectorHydrationErrorsExist ? (
                    <ConnectorDetailsMissing />
                ) : hasLength(connectorID) ? (
                    <>
                        <DetailsErrors />

                        <EndpointConfigErrors />

                        {resourceConfigErrorsExist || fullSourceErrorsExist ? (
                            <ResourceConfigErrors />
                        ) : null}
                    </>
                ) : (
                    <NoConnectorError />
                )}
            </AlertBox>
        </Collapse>
    ) : null;
}

export default ValidationErrorSummary;
