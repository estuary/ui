import { Alert, AlertTitle, Collapse } from '@mui/material';
import KeyValueList, { KeyValue } from 'components/shared/KeyValueList';
import { useRouteStore } from 'hooks/useRouteStore';
import { isEmpty, map } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';

function ValidationErrorSummary() {
    const intl = useIntl();

    const entityCreateStore = useRouteStore();
    const [detailErrors, specErrors] = entityCreateStore(
        entityCreateStoreSelectors.errors
    );
    const entityName = entityCreateStore(
        entityCreateStoreSelectors.details.entityName
    );
    const imageTag = entityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );
    const endpointSchema = entityCreateStore(
        entityCreateStoreSelectors.endpointConfig.data
    );
    const collections = entityCreateStore(
        entityCreateStoreSelectors.collections
    );
    const getResourceConfigErrors = entityCreateStore(
        entityCreateStoreSelectors.resourceConfig.getErrors
    );
    const resourceConfigErrors = getResourceConfigErrors();

    const displayValidation = entityCreateStore(
        entityCreateStoreSelectors.formState.displayValidation
    );

    const filteredDetailErrors = map(detailErrors, 'instancePath');
    const filteredSpecErrors = map(specErrors, 'instancePath');
    const filteredResourceConfigErrors = map(
        resourceConfigErrors,
        'instancePath'
    );
    const filteredErrorsList: KeyValue[] = [];

    // Check for a name
    if (isEmpty(entityName)) {
        filteredErrorsList.push({
            title: intl.formatMessage({
                id: 'foo.endpointConfig.entitynameMissing',
            }),
        });
    }

    // Check if there is a connector
    if (isEmpty(imageTag.id)) {
        filteredErrorsList.push({
            title: intl.formatMessage({
                id: 'foo.endpointConfig.connectorMissing',
            }),
        });
    }

    // If both the name and connector are there lets look for general errors
    if (filteredErrorsList.length === 0) {
        if (filteredDetailErrors.length > 0) {
            filteredErrorsList.push({
                title: intl.formatMessage({
                    id: 'foo.endpointConfig.detailsHaveErrors',
                }),
            });
        }

        // Check for errors in the endpoint config
        if (isEmpty(endpointSchema)) {
            filteredErrorsList.push({
                title: intl.formatMessage({
                    id: 'foo.endpointConfig.endpointConfigMissing',
                }),
            });
        } else if (filteredSpecErrors.length > 0) {
            filteredErrorsList.push({
                title: intl.formatMessage({
                    id: 'foo.endpointConfig.endpointConfigHaveErrors',
                }),
            });
        }

        // Check if they are missing collections and if not then check if resource config has errors
        if (!collections || collections.length === 0) {
            filteredErrorsList.push({
                title: intl.formatMessage({
                    id: 'foo.endpointConfig.collectionsMissing',
                }),
            });
        } else if (collections && filteredResourceConfigErrors.length > 0) {
            filteredErrorsList.push({
                title: intl.formatMessage({
                    id: 'foo.endpointConfig.resourceConfigHaveErrors',
                }),
            });
        }
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
