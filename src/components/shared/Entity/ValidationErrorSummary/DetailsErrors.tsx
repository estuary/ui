import KeyValueList from 'components/shared/KeyValueList';
import { useIntl } from 'react-intl';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useDetailsForm_customErrors } from 'stores/DetailsForm/hooks';
import { hasLength } from 'utils/misc-utils';

function DetailsErrors() {
    const intl = useIntl();

    const customErrors = useDetailsForm_customErrors();
    const entityName = useDetailsFormStore(
        (state) => state.details.data.entityName
    );
    const imageId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.id
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
    if (!hasLength(imageId)) {
        filteredErrorsList.push({
            title: intl.formatMessage({
                id: 'entityCreate.endpointConfig.connectorMissing',
            }),
        });
    }

    // If there are no other errors go ahead and show the custom ones
    if (!hasLength(filteredErrorsList) && hasLength(customErrors)) {
        customErrors.forEach((customError) =>
            filteredErrorsList.push({ title: customError.message })
        );
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
