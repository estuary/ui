import { Divider, Grid, Typography } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import { DataPreview } from 'components/collection/DataPreview';
import { createEditorStore } from 'components/editor/Store/create';
import PageContainer from 'components/shared/PageContainer';
import EditorAndLogs from 'components/tables/Details/EditorAndLogs';
import ShardInformation from 'components/tables/Details/ShardInformation';
import { useEntityType } from 'context/EntityContext';
import { LocalZustandProvider } from 'context/LocalZustand';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import { EditorStoreNames } from 'stores/names';

function Details() {
    useBrowserTitle('browserTitle.admin');
    const entityType = useEntityType();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const lastPubId = useGlobalSearchParams(GlobalSearchParams.LAST_PUB_ID);

    const isCollection = entityType === 'collection';

    return (
        <PageContainer
            pageTitleProps={{ header: authenticatedRoutes.details.title }}
        >
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
        </PageContainer>
    );
}

export default Details;
