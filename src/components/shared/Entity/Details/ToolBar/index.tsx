import { Stack, Typography } from '@mui/material';

import EditButton from 'src/components/shared/Entity/Details/ToolBar/EditButton';
import MaterializeButton from 'src/components/shared/Entity/Details/ToolBar/MaterializeButton';
import SyncNowButton from 'src/components/shared/Entity/Details/ToolBar/SyncNowButton';
import { truncateTextSx } from 'src/context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

function DetailsToolBar() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    return (
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
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

            <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'flex-start' }}
            >
                <SyncNowButton taskName={catalogName} />
                <EditButton buttonVariant="outlined" />

                <MaterializeButton />
            </Stack>
        </Stack>
    );
}

export default DetailsToolBar;
