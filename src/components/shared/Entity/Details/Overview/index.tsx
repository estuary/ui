import { Divider, Grid } from '@mui/material';
import { DataPreview } from 'components/collection/DataPreview';
import { useEditorStore_currentCatalog } from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { useMemo } from 'react';
import { hasLength, specContainsDerivation } from 'utils/misc-utils';
import ShardInformation from '../../Shard/Information';
import Endpoints from '../Endpoints';
import Usage from '../Usage';
import DetailsSection from './DetailsSection';

// TODO (details page)
// Temporary - allow to pass in the name
interface Props {
    name?: string;
}

function Overview({ name }: Props) {
    const entityType = useEntityType();
    const isCollection = entityType === 'collection';
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const entityName = name ?? catalogName;
    const { liveSpecs, isValidating: validatingLiveSpecs } = useLiveSpecs(
        entityType,
        entityName
    );

    const currentCatalog = useEditorStore_currentCatalog({
        localScope: true,
    });
    const catalogSpec = currentCatalog?.spec ?? null;
    const { isDerivation } = specContainsDerivation(catalogSpec);

    const latestLiveSpec = useMemo(
        () =>
            !validatingLiveSpecs && hasLength(liveSpecs) ? liveSpecs[0] : null,
        [liveSpecs, validatingLiveSpecs]
    );

    return (
        <Grid container spacing={2}>
            <Endpoints name={entityName} />

            <Grid
                item
                xs={12}
                md={8}
                lg={9}
                sx={{
                    bgColor: '#00ff00',
                }}
            >
                <Usage
                    catalogName={entityName}
                    createdAt={latestLiveSpec?.created_at}
                />
                <Divider />
            </Grid>

            <Grid item xs={12} md={4} lg={3}>
                <DetailsSection
                    entityName={entityName}
                    latestLiveSpec={latestLiveSpec}
                />
            </Grid>

            {!isCollection || isDerivation ? (
                <Grid item xs={12}>
                    <ShardInformation entityType={entityType} />
                </Grid>
            ) : null}

            {isCollection && entityName ? (
                <Grid item xs={12}>
                    <DataPreview collectionName={entityName} />
                </Grid>
            ) : null}
        </Grid>
    );
}

export default Overview;
