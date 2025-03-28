import { Drawer, IconButton, Toolbar, Typography } from '@mui/material';

import SidePanelIframe from './Iframe';
import { Xmark } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { useShowSidePanelDocs } from 'src/context/SidePanelDocs';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

interface Props {
    show: boolean;
}

function DocsSidePanel({ show }: Props) {
    const { setShowDocs } = useShowSidePanelDocs();

    return (
        <Drawer
            anchor="right"
            variant="permanent"
            className="pane-content"
            sx={{
                'width': '100%',
                '& .MuiDrawer-paper': {
                    width: '100%',
                    boxSizing: 'border-box',
                    position: 'absolute',
                },
            }}
            open={show}
        >
            <Toolbar />

            <Toolbar
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1,
                }}
            >
                <Typography variant="h5" component="span">
                    <FormattedMessage id="entityCreate.docs.header" />
                </Typography>

                <IconButton
                    size="small"
                    onClick={() => {
                        logRocketEvent(CustomEvents.HELP_DOCS, {
                            show: false,
                        });
                        setShowDocs(false);
                    }}
                    sx={{ color: (theme) => theme.palette.text.primary }}
                >
                    <Xmark />
                </IconButton>
            </Toolbar>

            <SidePanelIframe show={show} />
        </Drawer>
    );
}

export default DocsSidePanel;
