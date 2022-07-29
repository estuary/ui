import KeyValueList from 'components/shared/KeyValueList';
import { DetailsFormStoreNames, useZustandStore } from 'context/Zustand';
import { useIntl } from 'react-intl';
import { CreateState } from 'stores/MiniCreate';
import { hasLength } from 'utils/misc-utils';

interface Props {
    detailsFormStoreName: DetailsFormStoreNames;
}

function DetailsErrors({ detailsFormStoreName }: Props) {
    const intl = useIntl();

    const entityName = useZustandStore<
        CreateState,
        CreateState['details']['data']['entityName']
    >(detailsFormStoreName, (state) => state.details.data.entityName);

    const imageTag = useZustandStore<
        CreateState,
        CreateState['details']['data']['connectorImage']
    >(detailsFormStoreName, (state) => state.details.data.connectorImage);

    const filteredErrorsList: any[] = [];

    if (!hasLength(entityName)) {
        filteredErrorsList.push({
            title: intl.formatMessage({
                id: 'entityCreate.endpointConfig.entityNameMissing',
            }),
        });
    }

    // Check if there is a connector
    if (!hasLength(imageTag ? imageTag.id : '')) {
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
