import { Alert, AlertTitle, Collapse } from '@mui/material';
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
} from 'stores/EndpointConfig';
import { useFormStateStore_displayValidation } from 'stores/FormState';
import { hasLength } from 'utils/misc-utils';

interface Props {
    errorsExist: boolean;
    ErrorComponent?: any | boolean;
    hideIcon?: boolean;
    headerMessageId?: string;
    resourceConfigErrorsExist?: {
        hydration: boolean;
        form: boolean;
    };
}

function ValidationErrorSummary({
    headerMessageId,
    hideIcon,
    ErrorComponent,
    errorsExist,
    resourceConfigErrorsExist,
}: Props) {
    const connectorID = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    // Endpoint Config Store
    const endpointConfigHydrationErrorsExist =
        useEndpointConfig_hydrationErrorsExist();

    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();

    // Form State Store
    const displayValidation = useFormStateStore_displayValidation();

    const hydrationErrorsExist =
        endpointConfigHydrationErrorsExist ||
        resourceConfigErrorsExist?.hydration;

    const formErrorsExist =
        errorsExist ||
        endpointConfigErrorsExist ||
        resourceConfigErrorsExist?.form;

    const defaultHeaderMessageId = hydrationErrorsExist
        ? 'workflows.error.initForm'
        : 'entityCreate.endpointConfig.errorSummary';

    return displayValidation || hydrationErrorsExist ? (
        <Collapse in={formErrorsExist} timeout="auto" unmountOnExit>
            <Alert severity="error" icon={hideIcon ?? undefined}>
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
            </Alert>
        </Collapse>
    ) : null;
}

export default ValidationErrorSummary;
