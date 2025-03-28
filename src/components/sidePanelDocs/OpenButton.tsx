import {
    Box,
    Button,
    Collapse,
    Divider,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useShowSidePanelDocs } from 'src/context/SidePanelDocs';
import { SidebarCollapse } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useSidePanelDocsStore } from 'src/stores/SidePanelDocs/Store';
import { hasLength } from 'src/utils/misc-utils';

function SidePanelDocsOpenButton() {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const { showDocs, setShowDocs } = useShowSidePanelDocs();

    const docsURL = useSidePanelDocsStore((state) => state.url);
    const showButton = !showDocs && !belowMd && hasLength(docsURL);

    return (
        <Collapse in={showButton} orientation="horizontal" collapsedSize={0}>
            <Box sx={{ display: 'flex' }}>
                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ ml: 1, mr: 2 }}
                />

                <Tooltip
                    arrow
                    placement="bottom-end"
                    title={<FormattedMessage id="docs.cta.expand.tooltip" />}
                >
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                            logRocketEvent(CustomEvents.HELP_DOCS, {
                                show: true,
                            });
                            setShowDocs(true);
                        }}
                        endIcon={
                            <SidebarCollapse
                                style={{
                                    fontSize: 13,
                                }}
                            />
                        }
                    >
                        <FormattedMessage id="docs.cta.expand" />
                    </Button>
                </Tooltip>
            </Box>
        </Collapse>
    );
}

export default SidePanelDocsOpenButton;
