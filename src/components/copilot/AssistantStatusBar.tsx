import { Box, useMediaQuery, useTheme } from '@mui/material';

import { EntityHealthStrip } from 'src/components/copilot/EntityHealthStrip';
import SidePanelDocsOpenButton from 'src/components/sidePanelDocs/OpenButton';
import { UpdateAlert } from 'src/components/UpdateAlert';

// Shown in place of the assistant terminal when the assistant is disabled. The
// terminal absorbed the old top bar's chrome (entity health strip, update alert,
// docs toggle), so turning the chat off shouldn't take those with it — this is
// the same top-right cluster in a slim, static bar.

// Matches the assistant terminal's collapsed height so toggling the assistant
// on/off doesn't shift the cluster.
const BAR_HEIGHT = 48;

export function AssistantStatusBar() {
    const theme = useTheme();
    // The health strip needs some horizontal room; hide it below `md` (mirrors
    // the terminal's own gate).
    const showStatus = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 1.5,
                height: BAR_HEIGHT,
                pr: 1,
                background: theme.palette.background.default,
            }}
        >
            {showStatus ? <EntityHealthStrip /> : null}
            <UpdateAlert />
            <SidePanelDocsOpenButton />
        </Box>
    );
}
