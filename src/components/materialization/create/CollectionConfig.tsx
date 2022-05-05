import CollectionSelector from 'components/materialization/CollectionSelector';
import ResourceConfig from 'components/materialization/ResourceConfig';
import useEntityStore, { fooSelectors } from 'components/shared/Entity/Store';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { EventHandler } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    previewHandler: EventHandler<any>;
}

function CollectionConfig({ previewHandler }: Props) {
    const imageTag = useEntityStore(fooSelectors.connectorTag);

    if (imageTag) {
        return (
            <WrapperWithHeader
                header={
                    <FormattedMessage id="materializationCreation.collections.heading" />
                }
                body={
                    <>
                        <CollectionSelector preview={previewHandler} />
                        <ResourceConfig connectorImage={imageTag.id} />
                    </>
                }
            />
        );
    } else {
        return null;
    }
}

export default CollectionConfig;
