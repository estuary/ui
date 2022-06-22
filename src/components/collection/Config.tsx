import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { authenticatedRoutes } from 'app/Authenticated';
import ExpandableResourceConfig from 'components/collection/ExpandableResourceConfig';
import CollectionSelector from 'components/collection/Selector';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import {
    useLiveSpecsExtByLastPubId,
    useLiveSpecsExtWithOutSpec,
} from 'hooks/useLiveSpecsExt';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { entityCreateStoreSelectors } from 'stores/Create';
import { ENTITY } from 'types';

function CollectionConfig() {
    const useEntityCreateStore = useRouteStore();
    const imageTag = useEntityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );
    const collections = useEntityCreateStore(
        entityCreateStoreSelectors.collections
    );
    const prefillCollections = useEntityCreateStore(
        entityCreateStoreSelectors.prefillCollections
    );

    const [searchParams] = useSearchParams();
    const specID = searchParams.get(
        authenticatedRoutes.materializations.create.params.liveSpecId
    );
    const lastPubId = searchParams.get(
        authenticatedRoutes.materializations.create.params.lastPubId
    );

    const resourceConfigHasErrors = useEntityCreateStore(
        entityCreateStoreSelectors.resourceConfig.hasErrors
    );
    const collectionsHasErrors = useEntityCreateStore(
        entityCreateStoreSelectors.collectionsHasErrors
    );

    const { liveSpecs } = useLiveSpecsExtWithOutSpec(specID, ENTITY.CAPTURE);
    const { liveSpecs: liveSpecsByLastPub } = useLiveSpecsExtByLastPubId(
        lastPubId,
        ENTITY.CAPTURE
    );

    useEffect(() => {
        if (liveSpecs.length > 0) {
            prefillCollections(liveSpecs);
        }
    }, [liveSpecs, prefillCollections]);

    useEffect(() => {
        if (liveSpecsByLastPub.length > 0) {
            prefillCollections(liveSpecsByLastPub);
        }
    }, [liveSpecsByLastPub, prefillCollections]);

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
