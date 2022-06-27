import { Alert, AlertTitle, Collapse } from '@mui/material';
import DetailsErrors from 'components/shared/Entity/ValidationErrorSummary/DetailsErrors';
import EndpointConfigErrors from 'components/shared/Entity/ValidationErrorSummary/EndpointConfigErrors';
import ResourceConfigErrors from 'components/shared/Entity/ValidationErrorSummary/ResourceConfigErrors';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';

function ValidationErrorSummary() {
    const useEntityCreateStore = useRouteStore();
    const hasErrors = useEntityCreateStore(
        entityCreateStoreSelectors.hasErrors
    );

    console.log('error summary', hasErrors);

    return (
        <Collapse in={hasErrors} timeout="auto">
            <Alert severity="error">
                <AlertTitle>
                    <FormattedMessage id="entityCreate.endpointConfig.errorSummary" />
                </AlertTitle>

                <DetailsErrors />
                <EndpointConfigErrors />
                <ResourceConfigErrors />
            </Alert>
        </Collapse>
    );
}

export default ValidationErrorSummary;
