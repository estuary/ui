import CollectionSelector from 'components/materialization/CollectionSelector';
import ExpandableResourceConfig from 'components/materialization/create/ExpandableResourceConfig';
import useCreationStore, {
    creationSelectors,
} from 'components/materialization/Store';
import useEntityStore, { fooSelectors } from 'components/shared/Entity/Store';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { EventHandler } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    previewHandler: EventHandler<any>;
}

function CollectionConfig({ previewHandler }: Props) {
    const imageTag = useEntityStore(fooSelectors.connectorTag);
    const collections = useCreationStore(creationSelectors.collections);

    if (imageTag) {
        return (
            <WrapperWithHeader
                header={
                    <FormattedMessage id="materializationCreation.collections.heading" />
                }
                body={
                    <>
                        <CollectionSelector preview={previewHandler} />
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
                }
            />
        );
    } else {
        return null;
    }
}

export default CollectionConfig;
