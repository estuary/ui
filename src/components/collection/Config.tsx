import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { authenticatedRoutes } from 'app/Authenticated';
import BindingsMultiEditor from 'components/editor/Bindings';
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
    const prefillCollections = useEntityCreateStore(
        entityCreateStoreSelectors.collections.prefill
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
        entityCreateStoreSelectors.collections.hasErrors
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
                <BindingsMultiEditor />
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default CollectionConfig;
