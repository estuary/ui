import { Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import { createEditorStore } from 'components/editor/Store/create';
import EditorHydrator from 'components/editor/Store/Hydrator';
import { LocalZustandProvider } from 'context/LocalZustand';
import { truncateTextSx } from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { NavArrowLeft } from 'iconoir-react';
import { useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { EditorStoreNames } from 'stores/names';
import ShardHydrator from '../Shard/Hydrator';
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

    // Fetch react router stuff
    const navigate = useNavigate();
    const location = useLocation();

    // TODO (details) This always assumes the details is only 2 levels away from the parent
    //  we should probably make this less brittle in the future
    const backButtonUrlRef = useRef(location.state?.backButtonUrl ?? `../../`);
    const goBack = () => {
        navigate(backButtonUrlRef.current);
    };

    // We have already pulled the backButton path out of state we can put state back
    //  how it was. That way we are not cluttering it up
    useEffectOnce(() => {
        window.history.replaceState(
            {
                ...location.state,
                backButtonUrl: undefined,
            },
            document.title
        );
    });

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
                                <IconButton onClick={goBack}>
                                    <NavArrowLeft />
                                </IconButton>
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
