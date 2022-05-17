import { Alert, AlertTitle, Collapse } from '@mui/material';
import KeyValueList, { KeyValue } from 'components/shared/KeyValueList';
import { useRouteStore } from 'hooks/useRouteStore';
import { map } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';

// TODO : Delete this or make is useful. Right now JSON Forms is kinda hard to write custom validation
// just so that we don't have to display validation errors right away.
function ValidationErrorSummary() {
    const intl = useIntl();

    const entityCreateStore = useRouteStore();
    const [detailErrors, specErrors] = entityCreateStore(
        entityCreateStoreSelectors.errors
    );
    const displayValidation = entityCreateStore(
        entityCreateStoreSelectors.formState.displayValidation
    );

    const filteredDetailErrors = map(detailErrors, 'instancePath');
    const filteredSpecErrors = map(specErrors, 'instancePath');
    // const filteredErrors = uniq(
    //     map(filteredDetailErrors.concat(filteredSpecErrors), 'instancePath')
    // );

    const filteredErrorsList: KeyValue[] = [];

    if (filteredDetailErrors.length > 0) {
        filteredErrorsList.push({
            title: intl.formatMessage({
                id: 'foo.endpointConfig.detailsHaveErrors',
            }),
        });
    }

    if (filteredSpecErrors.length > 0) {
        filteredErrorsList.push({
            title: intl.formatMessage({
                id: 'foo.endpointConfig.endpointConfigHaveErrors',
            }),
        });
    }

    return (
        <Collapse
            in={displayValidation && filteredErrorsList.length > 0}
            timeout="auto"
        >
            <Alert severity="error">
                <AlertTitle>
                    <FormattedMessage id="foo.endpointConfig.errorSummary" />
                </AlertTitle>
                <KeyValueList data={filteredErrorsList} />
            </Alert>
        </Collapse>
    );
}

export default ValidationErrorSummary;
