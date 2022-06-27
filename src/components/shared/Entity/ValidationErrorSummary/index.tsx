import { Alert, AlertTitle, Collapse } from '@mui/material';
import DetailsErrors from 'components/shared/Entity/ValidationErrorSummary/DetailsErrors';
import EndpointConfigErrors from 'components/shared/Entity/ValidationErrorSummary/EndpointConfigErrors';
import ResourceConfigErrors from 'components/shared/Entity/ValidationErrorSummary/ResourceConfigErrors';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';

interface Props {
    ErrorComponent?: any | boolean;
    hideIcon?: boolean;
    headerMessageId?: string;
    hasErrorsSelector: Function;
}

function ValidationErrorSummary({
    headerMessageId,
    hideIcon,
    ErrorComponent,
    hasErrorsSelector,
}: Props) {
    const useEntityCreateStore = useRouteStore();
    const displayValidation = useEntityCreateStore(
        entityCreateStoreSelectors.formState.displayValidation
    );
    const hasErrors = useEntityCreateStore(hasErrorsSelector);

    return (
        <Collapse
            in={displayValidation && hasErrors}
            timeout="auto"
            unmountOnExit
        >
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
                        <DetailsErrors />
                        <EndpointConfigErrors />
                        <ResourceConfigErrors />
                    </>
                )}
            </Alert>
        </Collapse>
    );
}

export default ValidationErrorSummary;
