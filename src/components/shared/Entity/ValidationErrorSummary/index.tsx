import { AlertTitle, Collapse } from '@mui/material';
import { useBindingsEditorStore_fullSourceErrorsExist } from 'components/editor/Bindings/Store/hooks';
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
import { useDetailsForm_errorsExist } from 'stores/DetailsForm/hooks';
import {
    useEndpointConfigStore_errorsExist,
    useEndpointConfig_hydrationErrorsExist,
} from 'stores/EndpointConfig/hooks';
import { useFormStateStore_displayValidation } from 'stores/FormState/hooks';
import {
    useResourceConfig_hydrationErrorsExist,
    useResourceConfig_resourceConfigErrorsExist,
} from 'stores/ResourceConfig/hooks';
import { hasLength } from 'utils/misc-utils';

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

    // Details form
    const detailsFormErrorsExist = useDetailsForm_errorsExist();

    // Endpoint Config Store
    const endpointConfigHydrationErrorsExist =
        useEndpointConfig_hydrationErrorsExist();

    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();

    // Form State Store
    const displayValidation = useFormStateStore_displayValidation();

    // Resource Config Store
    const resourceConfigHydrationErrorsExist =
        useResourceConfig_hydrationErrorsExist();
    const resourceConfigErrorsExist =
        useResourceConfig_resourceConfigErrorsExist();

    const fullSourceErrorsExist =
        useBindingsEditorStore_fullSourceErrorsExist();

    const hydrationErrorsExist =
        endpointConfigHydrationErrorsExist ||
        resourceConfigHydrationErrorsExist;

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
