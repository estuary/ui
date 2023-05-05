import { AlertTitle, Collapse } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import DetailsErrors from 'components/shared/Entity/ValidationErrorSummary/DetailsErrors';
import EndpointConfigErrors from 'components/shared/Entity/ValidationErrorSummary/EndpointConfigErrors';
import NoConnectorError from 'components/shared/Entity/ValidationErrorSummary/NoConnectorError';
import ResourceConfigErrors from 'components/shared/Entity/ValidationErrorSummary/ResourceConfigErrors';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { FormattedMessage } from 'react-intl';
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
    errorsExist: boolean;
    ErrorComponent?: any | boolean;
    hideIcon?: boolean;
    headerMessageId?: string;
}

function ValidationErrorSummary({
    headerMessageId,
    hideIcon,
    ErrorComponent,
    errorsExist,
}: Props) {
    const connectorID = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

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

    const hydrationErrorsExist =
        endpointConfigHydrationErrorsExist ||
        resourceConfigHydrationErrorsExist;

    const formErrorsExist =
        errorsExist || endpointConfigErrorsExist || resourceConfigErrorsExist;

    console.log('validation error ', {
        errorsExist,
        endpointConfigErrorsExist,
        resourceConfigErrorsExist,
    });

    const defaultHeaderMessageId = hydrationErrorsExist
        ? 'workflows.error.initForm'
        : 'entityCreate.endpointConfig.errorSummary';

    return displayValidation || hydrationErrorsExist ? (
        <Collapse in={formErrorsExist} timeout="auto" unmountOnExit>
            <AlertBox severity="error" hideIcon={hideIcon}>
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

                        {resourceConfigErrorsExist ? (
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
