import { Box, Divider, Grid, Typography } from '@mui/material';
import { DataPreview } from 'components/collection/DataPreview';
import { createEditorStore } from 'components/editor/Store/create';
import { useEntityType } from 'context/EntityContext';
import { LocalZustandProvider } from 'context/LocalZustand';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import { EditorStoreNames } from 'stores/names';
import EditorAndLogs from './EditorAndLogs';
import ShardInformation from './ShardInformation';
import DetailTabs from './Tabs';

function EntityDetails() {
    useBrowserTitle('browserTitle.details');
    const entityType = useEntityType();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const lastPubId = useGlobalSearchParams(GlobalSearchParams.LAST_PUB_ID);

    const isCollection = entityType === 'collection';

    return (
        <Box>
            <DetailTabs />
            {catalogName}
            <LocalZustandProvider
                createStore={createEditorStore(EditorStoreNames.GENERAL)}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <ShardInformation entityType={entityType} />
                    </Grid>
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

export default EntityDetails;
