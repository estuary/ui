import KeyValueList from 'components/shared/KeyValueList';
import { useIntl } from 'react-intl';
import {
    useDetailsForm_connectorImage_id,
    useDetailsForm_details_entityName,
} from 'stores/DetailsForm';
import { hasLength } from 'utils/misc-utils';

function DetailsErrors() {
    const intl = useIntl();

    const entityName = useDetailsForm_details_entityName();
    const imageId = useDetailsForm_connectorImage_id();

    const filteredErrorsList: any[] = [];

    if (!hasLength(entityName)) {
        filteredErrorsList.push({
            title: intl.formatMessage({
                id: 'entityCreate.endpointConfig.entityNameMissing',
            }),
        });
    }

    // Check if there is a connector
    if (!hasLength(imageId)) {
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
