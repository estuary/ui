import { Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import { useShowSidePanelDocs } from 'context/SidePanelDocs';
import { Cancel } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import SidePanelIframe from './Iframe';

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
                        setShowDocs(false);
                    }}
                    sx={{ color: (theme) => theme.palette.text.primary }}
                >
                    <Cancel />
                </IconButton>
            </Toolbar>

            <SidePanelIframe show={show} />
        </Drawer>
    );
}

export default DocsSidePanel;
