/* eslint-disable react/destructuring-assignment */
import { IconButton, Menu, Tooltip } from '@mui/material';
import React, { ReactNode } from 'react';

type IconMenuProps = {
    ariaLabel: string;
    icon: ReactNode;
    identifier: string;
    children: ReactNode;
    tooltip: string;
};

const IconMenu = (props: IconMenuProps) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const id = `${props.identifier}-button`;
    const controls = `${props.identifier}-menu`;

    return (
        <>
            <Tooltip title={props.tooltip}>
                <IconButton
                    aria-label={props.ariaLabel}
                    id={id}
                    aria-controls={controls}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    {props.icon}
                </IconButton>
            </Tooltip>
            <Menu
                id={controls}
                aria-labelledby={id}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        '& .MuiAvatar-root': {
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                            width: 32,
                        },
                        '&:before': {
                            bgcolor: 'background.paper',
                            content: '""',
                            display: 'block',
                            height: 10,
                            position: 'absolute',
                            right: 14,
                            top: 0,
                            transform: 'translateY(-50%) rotate(45deg)',
                            width: 10,
                            zIndex: 0,
                        },
                        'filter': 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        'mt': 1.5,
                        'overflow': 'visible',
                    },
                }}
            >
                {props.children}
            </Menu>
        </>
    );
};

export default IconMenu;
