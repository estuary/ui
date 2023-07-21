import { ReactNode } from 'react';

import { AppBar, Toolbar } from '@mui/material';

interface Props {
    children: ReactNode;
}

function RelativeAppBar({ children }: Props) {
    return (
        <AppBar position="relative" elevation={0} color="default">
            <Toolbar variant="dense">{children}</Toolbar>
        </AppBar>
    );
}

export default RelativeAppBar;
