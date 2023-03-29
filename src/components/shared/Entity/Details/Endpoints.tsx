import { Divider, Grid } from '@mui/material';
import { TaskEndpoints } from 'components/shared/TaskEndpoints';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';

function Endpoints() {
    const entityType = useEntityType();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    if (entityType === 'capture' || entityType === 'materialization') {
        return (
            <Grid item xs={12}>
                <TaskEndpoints taskName={catalogName} />
                <Divider sx={{ mt: 4 }} />
            </Grid>
        );
    } else {
        return null;
    }
}

export default Endpoints;
