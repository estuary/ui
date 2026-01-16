import { useEffect, useRef } from 'react';

import { AlertTitle, Collapse } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import DetailsErrors from 'src/components/shared/Entity/ValidationErrorSummary/DetailsErrors';
import EndpointConfigErrors from 'src/components/shared/Entity/ValidationErrorSummary/EndpointConfigErrors';
import NoConnectorError from 'src/components/shared/Entity/ValidationErrorSummary/NoConnectorError';
import ResourceConfigErrors from 'src/components/shared/Entity/ValidationErrorSummary/ResourceConfigErrors';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import useScrollIntoView from 'src/hooks/useScrollIntoView';
import {
    useBinding_fullSourceErrorsExist,
    useBinding_hydrationErrorsExist,
    useBinding_resourceConfigErrorsExist,
} from 'src/stores/Binding/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfig_hydrationErrorsExist,
    useEndpointConfigStore_errorsExist,
} from 'src/stores/EndpointConfig/hooks';
import { useFormStateStore_displayValidation } from 'src/stores/FormState/hooks';
import { hasLength } from 'src/utils/misc-utils';

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
    const intl = useIntl();
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

    // Form State Store
    const displayValidation = useFormStateStore_displayValidation();

    const hydrationErrorsExist =
        endpointConfigHydrationErrorsExist || bindingHydrationErrorsExist;

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
            <AlertBox
                short={false}
                severity="error"
                hideIcon={hideIcon}
                ref={scrollToTarget}
            >
                <AlertTitle>
                    {intl.formatMessage({
                        id: headerMessageId ?? defaultHeaderMessageId,
                    })}
                </AlertTitle>

                {ErrorComponent === false ? null : ErrorComponent ? (
                    <ErrorComponent />
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
