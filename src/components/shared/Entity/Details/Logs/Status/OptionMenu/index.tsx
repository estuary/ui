import { Box, IconButton, Menu, PopoverProps, useTheme } from '@mui/material';
import {
    defaultOutline,
    menuBackgroundColor,
    paperBackground,
    paperBackgroundImage,
} from 'context/Theme';
import { MoreHoriz } from 'iconoir-react';
import { useState } from 'react';
import { OptionMenuProps } from './types';

export default function OptionMenu({ children, identifier }: OptionMenuProps) {
    const theme = useTheme();

    const [anchorEl, setAnchorEl] = useState<PopoverProps['anchorEl']>(null);

    const open = Boolean(anchorEl);

    const id = `${identifier}-button`;
    const controls = `${identifier}-menu`;

    return (
        <Box>
            <IconButton
                onClick={(
                    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
                ) => {
                    event.stopPropagation();
                    setAnchorEl(event.currentTarget);
                }}
                style={{
                    backgroundColor: menuBackgroundColor[theme.palette.mode],
                    borderRadius: 4,
                    height: 21,
                    marginLeft: 4,
                    paddingLeft: 3,
                    paddingRight: 3,
                }}
            >
                <MoreHoriz
                    style={{
                        color: theme.palette.text.primary,
                    }}
                />
            </IconButton>

            <Menu
                id={controls}
                aria-labelledby={id}
                anchorEl={anchorEl}
                open={open}
                onClose={() => {
                    setAnchorEl(null);
                }}
                transformOrigin={{
                    horizontal: 'right',
                    vertical: 'top',
                }}
                anchorOrigin={{
                    horizontal: 'right',
                    vertical: 'bottom',
                }}
                PaperProps={{
                    sx: {
                        backgroundImage:
                            paperBackgroundImage[theme.palette.mode],
                        border: defaultOutline[theme.palette.mode],
                        borderRadius: 3,
                        bgcolor: paperBackground[theme.palette.mode],
                        filter: 'rgb(50 50 93 / 2%) 0px 2px 5px -1px, rgb(0 0 0 / 5%) 0px 1px 3px -1px',
                        mt: 1,
                        overflow: 'visible',
                    },
                }}
            >
                {children}
            </Menu>
        </Box>
    );
}
