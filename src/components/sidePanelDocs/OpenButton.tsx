import {
    Box,
    Button,
    Collapse,
    Divider,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { SidebarCollapse } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import {
    useSidePanelDocsStore_setShow,
    useSidePanelDocsStore_show,
    useSidePanelDocsStore_url,
} from 'stores/SidePanelDocs/hooks';
import { hasLength } from 'utils/misc-utils';

function SidePanelDocsOpenButton() {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const docsURL = useSidePanelDocsStore_url();
    const showDocs = useSidePanelDocsStore_show();
    const setShowDocs = useSidePanelDocsStore_setShow();
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
                    title={<FormattedMessage id="docs.cta.expand.tooltip" />}
                >
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
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
