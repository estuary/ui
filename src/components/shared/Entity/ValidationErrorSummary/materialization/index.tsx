import { Alert, AlertTitle, Collapse } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import DetailsErrors from 'components/shared/Entity/ValidationErrorSummary/DetailsErrors';
import EndpointConfigErrors from 'components/shared/Entity/ValidationErrorSummary/EndpointConfigErrors';
import NoConnectorError from 'components/shared/Entity/ValidationErrorSummary/NoConnectorError';
import ResourceConfigErrors from 'components/shared/Entity/ValidationErrorSummary/ResourceConfigErrors';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_displayValidation } from 'stores/FormState';
import {
    useResourceConfig_hydrationErrorsExist,
    useResourceConfig_resourceConfigErrorsExist,
} from 'stores/ResourceConfig';
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

    const displayValidation = useFormStateStore_displayValidation();

    // Resource Config Store
    const resourceConfigHydrationErrorsExist =
        useResourceConfig_hydrationErrorsExist();

    const resourceConfigErrorsExist =
        useResourceConfig_resourceConfigErrorsExist();

    const defaultHeaderMessageId = resourceConfigHydrationErrorsExist
        ? 'workflows.error.initForm'
        : 'entityCreate.endpointConfig.errorSummary';

    return displayValidation || resourceConfigHydrationErrorsExist ? (
        <Collapse
            in={
                resourceConfigHydrationErrorsExist ||
                errorsExist ||
                resourceConfigErrorsExist
            }
            timeout="auto"
            unmountOnExit
        >
            <Alert severity="error" icon={hideIcon ?? undefined}>
                <AlertTitle>
                    <FormattedMessage
                        id={headerMessageId ?? defaultHeaderMessageId}
                    />
                </AlertTitle>

                {resourceConfigHydrationErrorsExist ? (
                    <MessageWithLink messageID="error.message" />
                ) : null}

                {ErrorComponent === false ? null : ErrorComponent ? (
                    <ErrorComponent />
                ) : hasLength(connectorID) ? (
                    <>
                        <DetailsErrors />

                        <EndpointConfigErrors />

                        <ResourceConfigErrors />
                    </>
                ) : (
                    <NoConnectorError />
                )}
            </Alert>
        </Collapse>
    ) : null;
}

export default ValidationErrorSummary;
