import Grid from '@mui/material/Grid/Grid';
import { routeDetails } from 'app/Authenticated';
import CollectionSelector from 'components/materialization/CollectionSelector';
import ExpandableResourceConfig from 'components/materialization/create/ExpandableResourceConfig';
import useCreationStore, {
    creationSelectors,
} from 'components/materialization/Store';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import useLiveSpecsExt from 'hooks/useLiveSpecsExt';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { createStoreSelectors } from 'stores/Create';
import { getStore } from 'stores/Repo';

function CollectionConfig() {
    const entityCreateStore = getStore(useRouteStore());
    const imageTag = entityCreateStore(
        createStoreSelectors.details.connectorTag
    );
    const collections = useCreationStore(creationSelectors.collections);
    const prefillCollections = useCreationStore(
        creationSelectors.prefillCollections
    );

    const [searchParams] = useSearchParams();
    const specID = searchParams.get(
        routeDetails.materializations.create.params.specID
    );

    const { liveSpecs } = useLiveSpecsExt(specID);

    useEffect(() => {
        if (liveSpecs.writes_to.length > 0) {
            prefillCollections(liveSpecs.writes_to);
        }
    }, [liveSpecs, prefillCollections]);

    if (imageTag) {
        return (
            <WrapperWithHeader
                header={
                    <FormattedMessage id="materializationCreation.collections.heading" />
                }
            >
                <>
                    <CollectionSelector />
                    <Grid
                        container
                        spacing={1}
                        columns={{ xs: 4, sm: 8, md: 12, lg: 12 }}
                    >
                        {collections.map((collection: any, index: number) => {
                            return (
                                <Grid
                                    item
                                    key={`CollectionResourceConfig-${index}`}
                                    xs={4}
                                    sm={4}
                                    md={4}
                                    lg={3}
                                >
                                    <ExpandableResourceConfig
                                        collectionName={collection}
                                        id={imageTag.id}
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>
                </>
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default CollectionConfig;
