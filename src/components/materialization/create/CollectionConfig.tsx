import CollectionSelector from 'components/materialization/CollectionSelector';
import ExpandableResourceConfig from 'components/materialization/create/ExpandableResourceConfig';
import useCreationStore, {
    creationSelectors,
} from 'components/materialization/Store';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { createStoreSelectors } from 'stores/Create';
import { getStore } from 'stores/Repo';

function CollectionConfig() {
    const entityCreateStore = getStore(useRouteStore());
    const imageTag = entityCreateStore(
        createStoreSelectors.details.connectorTag
    );
    const collections = useCreationStore(creationSelectors.collections);

    if (imageTag) {
        return (
            <WrapperWithHeader
                header={
                    <FormattedMessage id="materializationCreation.collections.heading" />
                }
            >
                <>
                    <CollectionSelector />
                    {collections.map((collection: any, index: number) => {
                        return (
                            <ExpandableResourceConfig
                                collectionName={collection}
                                id={imageTag.id}
                                key={`CollectionResourceConfig-${index}`}
                            />
                        );
                    })}
                </>
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default CollectionConfig;
