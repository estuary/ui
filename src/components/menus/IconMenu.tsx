/* eslint-disable react/destructuring-assignment */
import {
    Box,
    IconButton,
    Menu,
    PopoverProps,
    Tooltip,
    Typography,
} from '@mui/material';
import React, { ReactNode } from 'react';

type Props = {
    ariaLabel: string;
    icon: ReactNode;
    identifier: string;
    tooltip: string;
    verticalOrigin: 'top' | 'bottom';
    children: ReactNode;
};

const IconMenu = ({
    identifier,
    tooltip,
    ariaLabel,
    icon,
    verticalOrigin,
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
                <Box
                    sx={{
                        display: 'flex',
                        flexGrow: 1,
                        alignItems: 'center',
                    }}
                >
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

                    <Typography sx={{ width: 136, ml: 2, flexShrink: 0 }}>
                        {tooltip}
                    </Typography>
                </Box>
            </Tooltip>

            <Menu
                id={controls}
                aria-labelledby={id}
                anchorEl={anchorEl}
                open={open}
                onClose={handlers.close}
                onClick={handlers.close}
                transformOrigin={{
                    horizontal: 'left',
                    vertical: verticalOrigin,
                }}
                anchorOrigin={{ horizontal: 'right', vertical: verticalOrigin }}
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
                            bgcolor: 'primary.dark',
                            content: '""',
                            display: 'block',
                            height: 10,
                            position: 'absolute',
                            left: -5,
                            top: verticalOrigin === 'top' ? '8px' : '',
                            bottom: verticalOrigin === 'bottom' ? '22px' : '',
                            transform: 'translateY(-50%) rotate(45deg)',
                            width: 10,
                            zIndex: 0,
                        },
                        'filter': 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        'mt': 1.5,
                        'overflow': 'visible',
                        'bgcolor': 'primary.dark',
                        'borderRadius': '0px 10px 10px 0px',
                    },
                }}
            >
                {children}
            </Menu>
        </Box>
    );
};

export default IconMenu;
