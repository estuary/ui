import { Card, CardContent, Grid } from '@mui/material';
import { DataPreview } from 'components/collection/DataPreview';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import ShardInformation from './ShardInformation';

function Overview() {
    const entityType = useEntityType();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const isCollection = entityType === 'collection';

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <ShardInformation entityType={entityType} />
                    </CardContent>
                </Card>
            </Grid>

            {catalogName && isCollection ? (
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <DataPreview collectionName={catalogName} />
                        </CardContent>
                    </Card>
                </Grid>
            ) : null}
        </Grid>
    );
}

export default Overview;
