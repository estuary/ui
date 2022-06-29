import { Alert, AlertTitle, Collapse, useTheme } from '@mui/material';
import KeyValueList, { KeyValue } from 'components/shared/KeyValueList';
import { useRouteStore } from 'hooks/useRouteStore';
import { isEmpty, map } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';

function ValidationErrorSummary() {
    const intl = useIntl();
    const theme = useTheme();

    const useEntityCreateStore = useRouteStore();
    const [detailErrors, specErrors] = useEntityCreateStore(
        entityCreateStoreSelectors.errors
    );
    const entityName = useEntityCreateStore(
        entityCreateStoreSelectors.details.entityName
    );
    const imageTag = useEntityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );
    const endpointSchema = useEntityCreateStore(
        entityCreateStoreSelectors.endpointConfig.data
    );
    const collections = useEntityCreateStore(
        entityCreateStoreSelectors.collections
    );
    const getResourceConfigErrors = useEntityCreateStore(
        entityCreateStoreSelectors.resourceConfig.getErrors
    );
    const resourceConfigErrors = getResourceConfigErrors();

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
                id: 'entityCreate.endpointConfig.entityNameMissing',
            }),
        });
    }

    // Check if there is a connector
    if (isEmpty(imageTag.id)) {
        filteredErrorsList.push({
            title: intl.formatMessage({
                id: 'entityCreate.endpointConfig.connectorMissing',
            }),
        });
    }

    // If both the name and connector are there lets look for general errors
    if (filteredErrorsList.length === 0) {
        if (filteredDetailErrors.length > 0) {
            filteredErrorsList.push({
                title: intl.formatMessage({
                    id: 'entityCreate.endpointConfig.detailsHaveErrors',
                }),
            });
        }

        // Check for errors in the endpoint config
        if (isEmpty(endpointSchema)) {
            filteredErrorsList.push({
                title: intl.formatMessage({
                    id: 'entityCreate.endpointConfig.endpointConfigMissing',
                }),
            });
        } else if (filteredSpecErrors.length > 0) {
            filteredErrorsList.push({
                title: intl.formatMessage({
                    id: 'entityCreate.endpointConfig.endpointConfigHaveErrors',
                }),
            });
        }

        // Check if they are missing collections and if not then check if resource config has errors
        if (!collections || collections.length === 0) {
            filteredErrorsList.push({
                title: intl.formatMessage({
                    id: 'entityCreate.endpointConfig.collectionsMissing',
                }),
            });
        } else if (collections && filteredResourceConfigErrors.length > 0) {
            filteredErrorsList.push({
                title: intl.formatMessage({
                    id: 'entityCreate.endpointConfig.resourceConfigHaveErrors',
                }),
            });
        }
    }

    return (
        <Collapse in={filteredErrorsList.length > 0} timeout="auto">
            <Alert
                severity="error"
                variant={theme.palette.mode === 'dark' ? 'standard' : 'filled'}
                sx={{ mb: 2 }}
            >
                <AlertTitle>
                    <FormattedMessage id="entityCreate.endpointConfig.errorSummary" />
                </AlertTitle>

                <KeyValueList data={filteredErrorsList} />
            </Alert>
        </Collapse>
    );
}

export default ValidationErrorSummary;
