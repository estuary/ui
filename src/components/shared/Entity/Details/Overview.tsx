import { Box, Divider, Grid, Typography } from '@mui/material';
import { DataPreview } from 'components/collection/DataPreview';
import { createEditorStore } from 'components/editor/Store/create';
import { useEntityType } from 'context/EntityContext';
import { LocalZustandProvider } from 'context/LocalZustand';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { EditorStoreNames } from 'stores/names';
import DetailTabs from './Tabs';

function Overview() {
    useBrowserTitle('browserTitle.details');
    const entityType = useEntityType();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const isCollection = entityType === 'collection';

    return (
        <Box>
            <DetailTabs />
            <LocalZustandProvider
                createStore={createEditorStore(EditorStoreNames.GENERAL)}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h3">{catalogName}</Typography>
                    </Grid>

                    <Divider />

                    {catalogName && isCollection ? (
                        <Grid item xs={12}>
                            <DataPreview collectionName={catalogName} />
                        </Grid>
                    ) : null}
                </Grid>
            </LocalZustandProvider>
        </Box>
    );
}

export default Overview;
