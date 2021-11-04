import React from 'react';
import { IconButton, Link } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import HelpIcon from '@mui/icons-material/Help';

function HelpMenu() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton
                aria-label="Open help"
                id="help-button"
                aria-controls="help-menu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                <HelpIcon />
            </IconButton>
            <Menu
                id="help-menu"
                aria-labelledby="help-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
            >
                <MenuItem>
                    <Link href="https://docs.estuary.dev/" target="_blank">
                        Flow Docs
                    </Link>
                </MenuItem>
                <MenuItem>
                    <Link
                        href="https://join.slack.com/t/estuary-dev/shared_invite/zt-86nal6yr-VPbv~YfZE9Q~6Zl~gmZdFQ"
                        target="_blank"
                        rel="noopener"
                    >
                        Estuary's Slack
                    </Link>
                </MenuItem>
                <MenuItem>
                    <Link
                        href="https://www.estuary.dev/#get-in-touch"
                        target="_blank"
                    >
                        Contact Us
                    </Link>
                </MenuItem>
            </Menu>
        </>
    );
}

export default HelpMenu;
