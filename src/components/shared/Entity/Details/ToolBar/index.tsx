import { Box, Stack, Tooltip, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import DetailsRange from 'src/components/filters/DetailsRange';
import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';
import { useDetailsPage } from 'src/components/shared/Entity/Details/context';
import EditButton from 'src/components/shared/Entity/Details/ToolBar/EditButton';
import MaterializeButton from 'src/components/shared/Entity/Details/ToolBar/MaterializeButton';
import { useEntityType } from 'src/context/EntityContext';
import { truncateTextSx } from 'src/context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

function DetailsToolBar() {
    const intl = useIntl();

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const entityType = useEntityType();
    const page = useDetailsPage();

    // Only where something reads it. The range drives three things on a task's
    // Overview — the chart, the status strip's Data moved, and every figure in
    // the bindings table — which is what promoted it from a card header to a
    // page control. On Spec, History or Logs it would govern nothing, and a
    // collection keeps its picker on the chart card.
    const showRangePicker = page === 'overview' && entityType !== 'collection';

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
                <Typography
                    component="span"
                    variant="h6"
                    sx={{
                        ...truncateTextSx,
                        fontWeight: 600,
                    }}
                >
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

            <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', flexShrink: 0 }}
            >
                {showRangePicker ? (
                    <DetailsRange labelId="detailsPanel.recentUsage.range.label" />
                ) : null}

                <EditButton buttonVariant="outlined" />

                <MaterializeButton />
            </Stack>
        </Stack>
    );
}

export default DetailsToolBar;
