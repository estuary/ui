/* eslint-disable react/destructuring-assignment */
import { Box, IconButton, Menu, PopoverProps, Tooltip } from '@mui/material';
import React, { ReactNode } from 'react';

type Props = {
    ariaLabel: string;
    icon: ReactNode;
    identifier: string;
    children: ReactNode;
    tooltip: string;
};

const IconMenu = ({
    identifier,
    tooltip,
    ariaLabel,
    icon,
    children,
}: Props) => {
    const [anchorEl, setAnchorEl] =
        React.useState<PopoverProps['anchorEl']>(null);

    const open = Boolean(anchorEl);

    const handlers = {
        click: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            setAnchorEl(event.currentTarget);
        },
        close: () => {
            setAnchorEl(null);
        },
    };

    const id = `${identifier}-button`;
    const controls = `${identifier}-menu`;

    return (
        <Box sx={{ my: 0.5 }}>
            <Tooltip title={tooltip} placement="right-end">
                <IconButton
                    aria-label={ariaLabel}
                    id={id}
                    aria-controls={controls}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handlers.click}
                >
                    {icon}
                </IconButton>
            </Tooltip>

            <Menu
                id={controls}
                aria-labelledby={id}
                anchorEl={anchorEl}
                open={open}
                onClose={handlers.close}
                onClick={handlers.close}
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
                {children}
            </Menu>
        </Box>
    );
};

export default IconMenu;
