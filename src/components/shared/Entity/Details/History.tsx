import { Box, Grid } from '@mui/material';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import usePublicationSpecsExt_History from 'hooks/usePublicationSpecsExt';

function History() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const { publications, isValidating } =
        usePublicationSpecsExt_History(catalogName);

    if (isValidating) {
        return <>Loading...</>;
    }

    console.log('publications', publications);

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    This is the history page
                </Grid>
            </Grid>
        </Box>
    );
}

export default History;
