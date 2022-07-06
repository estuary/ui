import KeyValueList from 'components/shared/KeyValueList';
import { useRouteStore } from 'hooks/useRouteStore';
import { useIntl } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';
import { hasLength } from 'utils/misc-utils';

function DetailsErrors() {
    const intl = useIntl();

    const useEntityCreateStore = useRouteStore();
    const entityName = useEntityCreateStore(
        entityCreateStoreSelectors.details.entityName
    );
    const imageTag = useEntityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );

    const filteredErrorsList: any[] = [];

    if (!hasLength(entityName)) {
        filteredErrorsList.push({
            title: intl.formatMessage({
                id: 'entityCreate.endpointConfig.entityNameMissing',
            }),
        });
    }

    // Check if there is a connector
    if (!hasLength(imageTag.id)) {
        filteredErrorsList.push({
            title: intl.formatMessage({
                id: 'entityCreate.endpointConfig.connectorMissing',
            }),
        });
    }

    return (
        <KeyValueList
            data={filteredErrorsList}
            sectionTitle={intl.formatMessage({
                id: 'entityCreate.endpointConfig.detailsHaveErrors',
            })}
        />
    );
}

export default DetailsErrors;
