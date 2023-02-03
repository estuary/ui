import { Divider, Grid } from '@mui/material';
import { DataPreview } from 'components/collection/DataPreview';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import ShardInformation from '../Shard/Information';

function Overview() {
    const entityType = useEntityType();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const isCollection = entityType === 'collection';

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <ShardInformation entityType={entityType} />
            </Grid>

            {catalogName && isCollection ? (
                <Grid item xs={12}>
                    <Divider />

                    <DataPreview collectionName={catalogName} />
                </Grid>
            ) : null}
        </Grid>
    );
}

export default Overview;
