import KeyValueList from 'src/components/shared/KeyValueList';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { hasLength } from 'src/utils/misc-utils';

function DetailsErrors() {
    const customErrors = useDetailsFormStore((state) => state.customErrors);
    const entityName = useDetailsFormStore(
        (state) => state.details.data.entityName
    );
    const imageId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.id
    );

    const filteredErrorsList: any[] = [];

    if (!hasLength(entityName)) {
        filteredErrorsList.push({
            title: 'Name missing',
        });
    }

    // Check if there is a connector
    if (!hasLength(imageId)) {
        filteredErrorsList.push({
            title: 'Connector missing',
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
            sectionTitle="The Details section has errors:"
        />
    );
}

export default DetailsErrors;
