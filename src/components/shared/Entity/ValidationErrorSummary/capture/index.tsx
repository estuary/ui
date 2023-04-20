import { Collapse } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import DetailsErrors from 'components/shared/Entity/ValidationErrorSummary/DetailsErrors';
import EndpointConfigErrors from 'components/shared/Entity/ValidationErrorSummary/EndpointConfigErrors';
import NoConnectorError from 'components/shared/Entity/ValidationErrorSummary/NoConnectorError';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_displayValidation } from 'stores/FormState/hooks';
import { hasLength } from 'utils/misc-utils';

interface Props {
    errorsExist: boolean;
    ErrorComponent?: any | boolean;
    headerMessageId?: string;
    hideIcon?: boolean;
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
            <AlertBox
                hideIcon={hideIcon}
                severity="error"
                title={
                    <FormattedMessage
                        id={
                            headerMessageId ??
                            'entityCreate.endpointConfig.errorSummary'
                        }
                    />
                }
            >
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
            </AlertBox>
        </Collapse>
    ) : null;
}

export default ValidationErrorSummary;
