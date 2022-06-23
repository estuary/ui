import NewMaterializationResourceConfig from 'components/collection/ResourceConfig';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';

function BindingsEditor() {
    const useEntityCreateStore = useRouteStore();
    const imageTag = useEntityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );
    const currentCollection = useEntityCreateStore(
        entityCreateStoreSelectors.currentCollection
    );

    if (currentCollection) {
        return (
            <NewMaterializationResourceConfig
                connectorImage={imageTag.id}
                collectionName={currentCollection}
            />
        );
    } else {
        return (
            <FormattedMessage id="entityCreate.bindingsConfig.noRowsTitle" />
        );
    }
}

export default BindingsEditor;
