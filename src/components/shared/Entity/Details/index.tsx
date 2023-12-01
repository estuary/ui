import { Box, Divider, Stack, Typography } from '@mui/material';
import LiveSpecsHydrator from 'components/editor/Store/LiveSpecsHydrator';
import { createEditorStore } from 'components/editor/Store/create';
import EditButton from 'components/shared/Entity/Details/EditButton';
import MaterializeButton from 'components/shared/Entity/Details/MaterializeButton';
import RenderTab from 'components/shared/Entity/Details/RenderTab';
import DetailTabs from 'components/shared/Entity/Details/Tabs';
import { LocalZustandProvider } from 'context/LocalZustand';
import { truncateTextSx } from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useMemo } from 'react';
import { EditorStoreNames } from 'stores/names';
import ShardHydrator from '../Shard/Hydrator';

function EntityDetails() {
    useBrowserTitle('routeTitle.details');

    // Generate the local store
    const localStore = useMemo(
        () => createEditorStore(EditorStoreNames.GENERAL),
        []
    );

    // Fetch params from URL
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    return (
        <LocalZustandProvider createStore={localStore}>
            <LiveSpecsHydrator
                collectionNames={[catalogName]}
                localZustandScope={true}
            >
                <ShardHydrator catalogName={catalogName}>
                    <Stack spacing={2} sx={{ m: 1 }}>
                        <Stack
                            direction="row"
                            sx={{
                                justifyContent: 'space-between',
                            }}
                        >
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

                            <Stack direction="row">
                                <EditButton buttonVariant="outlined" />

                                <MaterializeButton />
                            </Stack>
                        </Stack>

                        <Divider />

                        <DetailTabs />
                    </Stack>

                    <Box sx={{ m: 1 }}>
                        <RenderTab />
                    </Box>
                </ShardHydrator>
            </LiveSpecsHydrator>
        </LocalZustandProvider>
    );
}

export default EntityDetails;
