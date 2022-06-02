import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { routeDetails } from 'app/Authenticated';
import ExpandableResourceConfig from 'components/collection/ExpandableResourceConfig';
import CollectionSelector from 'components/collection/Selector';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { useLiveSpecsExtWithOutSpec } from 'hooks/useLiveSpecsExt';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { entityCreateStoreSelectors } from 'stores/Create';
import { ENTITY } from 'types';

function CollectionConfig() {
    const entityCreateStore = useRouteStore();
    const imageTag = entityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );
    const collections = entityCreateStore(
        entityCreateStoreSelectors.collections
    );
    const prefillCollections = entityCreateStore(
        entityCreateStoreSelectors.prefillCollections
    );

    const [searchParams] = useSearchParams();
    const specID = searchParams.get(
        routeDetails.materializations.create.params.specID
    );

    const resourceConfigHasErrors = entityCreateStore(
        entityCreateStoreSelectors.resourceConfig.hasErrors
    );
    const collectionsHasErrors = entityCreateStore(
        entityCreateStoreSelectors.collectionsHasErrors
    );

    const { liveSpecs } = useLiveSpecsExtWithOutSpec(specID, ENTITY.CAPTURE);

    useEffect(() => {
        if (liveSpecs.length > 0) {
            prefillCollections(liveSpecs);
        }
    }, [liveSpecs, prefillCollections]);

    if (imageTag) {
        return (
            <WrapperWithHeader
                header={
                    <>
                        {resourceConfigHasErrors || collectionsHasErrors ? (
                            <ErrorOutlineIcon color="error" sx={{ pr: 1 }} />
                        ) : null}
                        <FormattedMessage id="materializationCreate.collections.heading" />
                    </>
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
