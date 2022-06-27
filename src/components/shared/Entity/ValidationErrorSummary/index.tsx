import { Alert, AlertTitle, Collapse } from '@mui/material';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';

interface Props {
    ErrorComponent?: any | null;
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

                {ErrorComponent ? <ErrorComponent /> : null}
            </Alert>
        </Collapse>
    );
}

export default ValidationErrorSummary;
