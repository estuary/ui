import { Box, Divider, Stack, Typography } from '@mui/material';
import { createEditorStore } from 'components/editor/Store/create';
import LiveSpecsHydrator from 'components/editor/Store/LiveSpecsHydrator';
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
import { useUnmount } from 'react-use';
import { useEntityStatusStore } from 'stores/EntityStatus/Store';
import { EditorStoreNames } from 'stores/names';
import ShardHydrator from '../Shard/Hydrator';

// TODO: Hydrate the journal store in a single location that satisfies
//   the needs of components dependent on its state.
function EntityDetails() {
    useBrowserTitle('routeTitle.details');

    // Generate the local store
    const localStore = useMemo(
        () => createEditorStore(EditorStoreNames.GENERAL),
        []
    );

    // Fetch params from URL
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const resetEntityStatusState = useEntityStatusStore(
        (state) => state.resetState
    );

    useUnmount(() => {
        resetEntityStatusState();
    });

    return (
        <LocalZustandProvider createStore={localStore}>
            <LiveSpecsHydrator catalogName={catalogName} localZustandScope>
                <ShardHydrator catalogName={catalogName}>
                    <Stack spacing={2} sx={{ m: 1 }}>
                        <Stack
                            direction="row"
                            sx={{ justifyContent: 'space-between' }}
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
