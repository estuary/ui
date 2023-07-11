import { Box, Divider, Stack, Typography } from '@mui/material';
import { createEditorStore } from 'components/editor/Store/create';
import EditorHydrator from 'components/editor/Store/Hydrator';
import { LocalZustandProvider } from 'context/LocalZustand';
import { truncateTextSx } from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useMemo } from 'react';
import { EditorStoreNames } from 'stores/names';
import ShardHydrator from '../Shard/Hydrator';
import EditButton from './EditButton';
import RenderTab from './RenderTab';
import DetailTabs from './Tabs';

function EntityDetails() {
    useBrowserTitle('routeTitle.details');

    // Generate the local store
    const localStore = useMemo(
        () => createEditorStore(EditorStoreNames.GENERAL),
        []
    );

    // Fetch params from URL
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const lastPubId = useGlobalSearchParams(GlobalSearchParams.LAST_PUB_ID);

    return (
        <LocalZustandProvider createStore={localStore}>
            <EditorHydrator
                collectionNames={[catalogName]}
                lastPubId={lastPubId}
                localZustandScope={true}
            >
                <ShardHydrator lastPubId={lastPubId} catalogName={catalogName}>
                    <Box>
                        <Stack spacing={2} sx={{ m: 1 }}>
                            <Stack direction="row" spacing={1}>
                                <Typography
                                    component="span"
                                    variant="h6"
                                    sx={{
                                        ...truncateTextSx,
                                        alignItems: 'center',
                                    }}
                                >
                                    {catalogName}
                                </Typography>
                                <EditButton />
                            </Stack>
                            <Divider />
                            <DetailTabs />
                        </Stack>

                        <Box sx={{ m: 1 }}>
                            <RenderTab />
                        </Box>
                    </Box>
                </ShardHydrator>
            </EditorHydrator>
        </LocalZustandProvider>
    );
}

export default EntityDetails;
