import { Grid } from '@mui/material';
import { TaskEndpoints } from 'components/shared/TaskEndpoints';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';

// TODO (details page)
// Temporary - allow to pass in the name
interface Props {
    name?: string;
}

function Endpoints({ name }: Props) {
    const entityType = useEntityType();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const entityName = name ?? catalogName;

    if (entityType === 'capture' || entityType === 'materialization') {
        return (
            <Grid item xs={12}>
                <TaskEndpoints taskName={entityName} />
                {/*
                    TODO (Details Page)
                <Divider sx={{ mt: 4 }} />*/}
            </Grid>
        );
    } else {
        return null;
    }
}

export default Endpoints;
