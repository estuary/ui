import { Box, Divider, Stack, Typography } from '@mui/material';
import { createEditorStore } from 'components/editor/Store/create';
import EditorHydrator from 'components/editor/Store/Hydrator';
import { LocalZustandProvider } from 'context/LocalZustand';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { EditorStoreNames } from 'stores/names';
import { useDetailsPage } from './context';
import History from './History';
import Overview from './Overview';
import Spec from './Spec';
import DetailTabs from './Tabs';

function EntityDetails() {
    useBrowserTitle('browserTitle.details');
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const lastPubId = useGlobalSearchParams(GlobalSearchParams.LAST_PUB_ID);
    const page = useDetailsPage();

    return (
        <LocalZustandProvider
            createStore={createEditorStore(EditorStoreNames.GENERAL)}
        >
            <EditorHydrator
                collectionNames={[catalogName]}
                lastPubId={lastPubId}
                localZustandScope={true}
            >
                <Box>
                    <Stack direction="column" spacing={2} sx={{ m: 1 }}>
                        <Typography
                            component="span"
                            variant="h6"
                            sx={{
                                alignItems: 'center',
                            }}
                        >
                            {catalogName}
                        </Typography>
                        <Divider />
                        <DetailTabs />
                    </Stack>

                    <Box sx={{ m: 1 }}>
                        {/* TODO (details:history) not currently live but is here to make sure it can render*/}
                        {page === 'history' ? (
                            <History />
                        ) : page === 'spec' ? (
                            <Spec />
                        ) : (
                            <Overview />
                        )}
                    </Box>
                </Box>
            </EditorHydrator>
        </LocalZustandProvider>
    );
}

export default EntityDetails;
