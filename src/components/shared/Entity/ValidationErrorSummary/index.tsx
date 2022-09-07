import { Alert, AlertTitle, Collapse } from '@mui/material';
import DetailsErrors from 'components/shared/Entity/ValidationErrorSummary/DetailsErrors';
import EndpointConfigErrors from 'components/shared/Entity/ValidationErrorSummary/EndpointConfigErrors';
import NoConnectorError from 'components/shared/Entity/ValidationErrorSummary/NoConnectorError';
import ResourceConfigErrors from 'components/shared/Entity/ValidationErrorSummary/ResourceConfigErrors';
import {
    FormStateStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import useGlobalSearchParams, {
    globalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { FormattedMessage } from 'react-intl';
import { EntityFormState } from 'stores/FormState';
import { hasLength } from 'utils/misc-utils';

interface Props {
    formStateStoreName: FormStateStoreNames;
    resourceConfigStoreName?: ResourceConfigStoreNames;
    ErrorComponent?: any | boolean;
    hideIcon?: boolean;
    headerMessageId?: string;
    errorsExist: boolean;
}

function ValidationErrorSummary({
    formStateStoreName,
    resourceConfigStoreName,
    headerMessageId,
    hideIcon,
    ErrorComponent,
    errorsExist,
}: Props) {
    const [connectorID] = useGlobalSearchParams([
        globalSearchParams.connectorId,
    ]);

    const displayValidation = useZustandStore<
        EntityFormState,
        EntityFormState['formState']['displayValidation']
    >(formStateStoreName, (state) => state.formState.displayValidation);

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
                        {resourceConfigStoreName ? (
                            <ResourceConfigErrors
                                resourceConfigStoreName={
                                    resourceConfigStoreName
                                }
                            />
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
