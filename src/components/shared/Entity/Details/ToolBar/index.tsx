import { Box, Stack, Tooltip, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';
import EditButton from 'src/components/shared/Entity/Details/ToolBar/EditButton';
import MaterializeButton from 'src/components/shared/Entity/Details/ToolBar/MaterializeButton';
import { truncateTextSx } from 'src/context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

function DetailsToolBar() {
    const intl = useIntl();

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const copyLabel = intl.formatMessage({ id: 'details.toolbar.copyName' });

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between' }}
        >
            {/* minWidth 0 so the name still truncates now that something sits
                beside it: a flex item's floor is its content by default, so a
                long catalog name would push the buttons off the right edge
                instead of ellipsing. */}
            <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: 'center', minWidth: 0 }}
            >
                <Typography component="span" variant="h6" sx={truncateTextSx}>
                    {catalogName}
                </Typography>

                {/* The name is the one thing on this page people paste
                    elsewhere — into flowctl, a ticket, a Slack thread — and it
                    is also the thing truncation can take away from them. */}
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
