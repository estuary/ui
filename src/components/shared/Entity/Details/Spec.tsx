import { Grid, Typography } from '@mui/material';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { FormattedMessage } from 'react-intl';
import EditorAndLogs from './EditorAndLogs';

function Spec() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const lastPubId = useGlobalSearchParams(GlobalSearchParams.LAST_PUB_ID);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="subtitle1">
                    <FormattedMessage id="detailsPanel.specification.header" />
                </Typography>
                <EditorAndLogs
                    collectionNames={[catalogName]}
                    lastPubId={lastPubId}
                    disableLogs={true}
                    localZustandScope={true}
                />
            </Grid>
        </Grid>
    );
}

export default Spec;
