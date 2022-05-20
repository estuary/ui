import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Grid } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import CollectionSelector from 'components/materialization/CollectionSelector';
import ExpandableResourceConfig from 'components/materialization/create/ExpandableResourceConfig';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import useLiveSpecsExt from 'hooks/useLiveSpecsExt';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { entityCreateStoreSelectors } from 'stores/Create';

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

    const getErrors = entityCreateStore(
        entityCreateStoreSelectors.resourceConfig.getErrors
    );

    const { liveSpecs } = useLiveSpecsExt(specID);

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
                        {' '}
                        {getErrors().length > 0 ? (
                            <ErrorOutlineIcon color="error" sx={{ pr: 1 }} />
                        ) : null}
                        <FormattedMessage id="materializationCreation.collections.heading" />
                    </>
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
