import { Button, useMediaQuery, useTheme } from '@mui/material';

import { SidebarCollapse } from 'iconoir-react';

import { useShowSidePanelDocs } from 'src/context/SidePanelDocs';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useSidePanelDocsStore } from 'src/stores/SidePanelDocs/Store';
import { hasLength } from 'src/utils/misc-utils';

export function SidePanelDocsOpenButton() {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const { showDocs, setShowDocs } = useShowSidePanelDocs();

    const docsURL = useSidePanelDocsStore((state) => state.url);
    const showButton = !showDocs && !belowMd && hasLength(docsURL);

    if (!showButton) {
        return null;
    }
    return (
        <Button
            size="small"
            variant="text"
            sx={{ my: 0, py: 0 }}
            onClick={() => {
                logRocketEvent(CustomEvents.HELP_DOCS, {
                    show: true,
                });
                setShowDocs(true);
            }}
            endIcon={
                <SidebarCollapse
                    style={{
                        fontSize: 12,
                    }}
                />
            }
        >
            Connector Docs
        </Button>
    );
}
