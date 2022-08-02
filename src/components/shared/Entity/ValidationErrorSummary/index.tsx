import { Alert, AlertTitle, Collapse } from '@mui/material';
import DetailsErrors from 'components/shared/Entity/ValidationErrorSummary/DetailsErrors';
import EndpointConfigErrors from 'components/shared/Entity/ValidationErrorSummary/EndpointConfigErrors';
import ResourceConfigErrors from 'components/shared/Entity/ValidationErrorSummary/ResourceConfigErrors';
import {
    DetailsFormStoreNames,
    EndpointConfigStoreNames,
    FormStateStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { FormattedMessage } from 'react-intl';
import { EntityFormState } from 'stores/FormState';

interface Props {
    endpointConfigStoreName: EndpointConfigStoreNames;
    formStateStoreName: FormStateStoreNames;
    detailsFormStoreName: DetailsFormStoreNames;
    resourceConfigStoreName?: ResourceConfigStoreNames;
    ErrorComponent?: any | boolean;
    hideIcon?: boolean;
    headerMessageId?: string;
    errorsExist: boolean;
}

function ValidationErrorSummary({
    endpointConfigStoreName,
    formStateStoreName,
    detailsFormStoreName,
    resourceConfigStoreName,
    headerMessageId,
    hideIcon,
    ErrorComponent,
    errorsExist,
}: Props) {
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
                ) : (
                    <>
                        <DetailsErrors
                            detailsFormStoreName={detailsFormStoreName}
                        />

                        <EndpointConfigErrors
                            endpointConfigStoreName={endpointConfigStoreName}
                        />

                        {resourceConfigStoreName ? (
                            <ResourceConfigErrors
                                resourceConfigStoreName={
                                    resourceConfigStoreName
                                }
                            />
                        ) : null}
                    </>
                )}
            </Alert>
        </Collapse>
    ) : null;
}

export default ValidationErrorSummary;
