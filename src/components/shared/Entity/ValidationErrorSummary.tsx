import { Alert, AlertTitle, Collapse } from '@mui/material';
import { KeyValue } from 'components/shared/KeyValueList';
import { useRouteStore } from 'hooks/useRouteStore';
import { map, uniq } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { createStoreSelectors } from 'stores/Create';
import { getStore } from 'stores/Repo';

// TODO : Delete this or make is useful. Right now JSON Forms is kinda hard to write custom validation
// just so that we don't have to display validation errors right away.
function ValidationErrorSummary() {
    const entityCreateStore = getStore(useRouteStore());
    const [detailErrors, specErrors] = entityCreateStore(
        createStoreSelectors.errors
    );
    const displayValidation = entityCreateStore(
        createStoreSelectors.formState.displayValidation
    );
    const filteredErrors = uniq(
        map(detailErrors.concat(specErrors), 'instancePath')
    );

    const filteredErrorsList: KeyValue[] = filteredErrors.map((formError) => ({
        title: formError,
        val: formError,
    }));

    return (
        <Collapse
            in={displayValidation && filteredErrorsList.length > 0}
            timeout="auto"
        >
            <Alert severity="error">
                <AlertTitle>
                    <FormattedMessage id="foo.endpointConfig.errorSummary" />
                </AlertTitle>
                {/* <KeyValueList data={filteredErrorsList} /> */}
            </Alert>
        </Collapse>
    );
}

export default ValidationErrorSummary;
