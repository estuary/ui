/* eslint-disable react/destructuring-assignment */
import {
    Box,
    IconButton,
    Menu,
    PopoverOrigin,
    PopoverProps,
    SxProps,
    Theme,
    Tooltip,
} from '@mui/material';
import { indigo } from 'context/Theme';
import React, { ReactNode } from 'react';

interface CustomPopoverPosition {
    transformOrigin?: PopoverOrigin;
    anchorOrigin?: PopoverOrigin;
}

interface Props {
    ariaLabel: string;
    icon: ReactNode;
    identifier: string;
    tooltip: string;
    children: ReactNode;
    hideArrow?: boolean;
    customMenuPosition?: CustomPopoverPosition;
}

const IconMenu = ({
    identifier,
    tooltip,
    ariaLabel,
    icon,
    children,
    hideArrow,
    customMenuPosition,
}: Props) => {
    const [anchorEl, setAnchorEl] =
        React.useState<PopoverProps['anchorEl']>(null);

    const open = Boolean(anchorEl);

    const handlers = {
        click: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            event.stopPropagation();
            setAnchorEl(event.currentTarget);
        },
        close: () => {
            setAnchorEl(null);
        },
    };

    const arrowSx: SxProps<Theme> = hideArrow
        ? {}
        : {
              '&:before': {
                  bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                          ? 'primary.dark'
                          : indigo[200],
                  content: '""',
                  display: 'block',
                  height: 10,
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  transform: 'translateY(-50%) rotate(45deg)',
                  width: 10,
                  zIndex: 0,
              },
          };

    const id = `${identifier}-button`;
    const controls = `${identifier}-menu`;

    return (
        <Box sx={{ my: 0.5 }}>
            <Tooltip title={tooltip} placement="bottom-end">
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
                </Box>
            </Tooltip>

            <Menu
                id={controls}
                aria-labelledby={id}
                anchorEl={anchorEl}
                open={open}
                onClose={handlers.close}
                onClick={handlers.close}
                transformOrigin={
                    customMenuPosition?.transformOrigin ?? {
                        horizontal: 'right',
                        vertical: 'top',
                    }
                }
                anchorOrigin={
                    customMenuPosition?.anchorOrigin ?? {
                        horizontal: 'right',
                        vertical: 'bottom',
                    }
                }
                PaperProps={{
                    elevation: 0,
                    sx: {
                        ...arrowSx,
                        '& .MuiAvatar-root': {
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                            width: 32,
                        },
                        'filter': 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        'mt': 1.5,
                        'overflow': 'visible',
                        'bgcolor': (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'primary.dark'
                                : indigo[200],
                        'borderRadius': '10px',
                    },
                }}
            >
                {children}
            </Menu>
        </Box>
    );
};

export default IconMenu;
