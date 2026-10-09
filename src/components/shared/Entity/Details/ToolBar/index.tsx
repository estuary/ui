import { Box, Stack, Tooltip, Typography } from '@mui/material';

import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';
import EditButton from 'src/components/shared/Entity/Details/ToolBar/EditButton';
import MaterializeButton from 'src/components/shared/Entity/Details/ToolBar/MaterializeButton';
import { truncateTextSx } from 'src/context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

function DetailsToolBar() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const copyLabel = 'Copy name';

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between' }}
        >
            {/* minWidth 0, or a flex item's content-width floor lets a long
                name push the buttons off the edge instead of truncating. */}
            <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: 'center', minWidth: 0 }}
            >
                <Typography component="span" variant="h6" sx={truncateTextSx}>
                    {catalogName}
                </Typography>

                <Tooltip title={copyLabel}>
                    <Box component="span" sx={{ display: 'flex' }}>
                        <CopyToClipboardButton
                            label={copyLabel}
                            writeValue={catalogName}
                        />
                    </Box>
                </Tooltip>
            </Stack>

            <Stack direction="row" sx={{ flexShrink: 0 }}>
                <EditButton buttonVariant="outlined" />

                <MaterializeButton />
            </Stack>
        </Stack>
    );
}

export default DetailsToolBar;
