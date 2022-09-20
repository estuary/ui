import { Alert, AlertTitle, Collapse } from '@mui/material';
import DetailsErrors from 'components/shared/Entity/ValidationErrorSummary/DetailsErrors';
import EndpointConfigErrors from 'components/shared/Entity/ValidationErrorSummary/EndpointConfigErrors';
import NoConnectorError from 'components/shared/Entity/ValidationErrorSummary/NoConnectorError';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_displayValidation } from 'stores/FormState';
import { hasLength } from 'utils/misc-utils';

interface Props {
    ErrorComponent?: any | boolean;
    hideIcon?: boolean;
    headerMessageId?: string;
    errorsExist: boolean;
}

function ValidationErrorSummary({
    headerMessageId,
    hideIcon,
    ErrorComponent,
    errorsExist,
}: Props) {
    const connectorID = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const displayValidation = useFormStateStore_displayValidation();

    return displayValidation ? (
        <Collapse in={errorsExist} timeout="auto" unmountOnExit>
            <Alert severity="error" icon={hideIcon ?? undefined}>
                <AlertTitle>
                    <FormattedMessage
                        id={
                            headerMessageId ??
                            'entityCreate.endpointConfig.errorSummary'
                        }
                    />
                </AlertTitle>

                {ErrorComponent === false ? null : ErrorComponent ? (
                    <ErrorComponent />
                ) : hasLength(connectorID) ? (
                    <>
                        <DetailsErrors />

                        <EndpointConfigErrors />
                    </>
                ) : (
                    <NoConnectorError />
                )}
            </Alert>
        </Collapse>
    ) : null;
}

export default ValidationErrorSummary;
