import { Alert, AlertTitle, Collapse } from '@mui/material';
import DetailsErrors from 'components/shared/Entity/ValidationErrorSummary/DetailsErrors';
import EndpointConfigErrors from 'components/shared/Entity/ValidationErrorSummary/EndpointConfigErrors';
import ResourceConfigErrors from 'components/shared/Entity/ValidationErrorSummary/ResourceConfigErrors';
import {
    DetailsFormStoreNames,
    EndpointConfigStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { DetailsFormState } from 'stores/DetailsForm';

interface Props {
    endpointConfigStoreName: EndpointConfigStoreNames;
    detailsFormStoreName: DetailsFormStoreNames;
    resourceConfigStoreName?: ResourceConfigStoreNames;
    ErrorComponent?: any | boolean;
    hideIcon?: boolean;
    headerMessageId?: string;
    hasErrorsSelector: Function;
}

function ValidationErrorSummary({
    endpointConfigStoreName,
    detailsFormStoreName,
    resourceConfigStoreName,
    headerMessageId,
    hideIcon,
    ErrorComponent,
    hasErrorsSelector,
}: Props) {
    const useEntityCreateStore = useRouteStore();

    const displayValidation = useZustandStore<
        DetailsFormState,
        DetailsFormState['formState']['displayValidation']
    >(detailsFormStoreName, (state) => state.formState.displayValidation);

    const hasErrors = useEntityCreateStore(hasErrorsSelector);

    return displayValidation ? (
        <Collapse in={Boolean(hasErrors)} timeout="auto" unmountOnExit>
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
