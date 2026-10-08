import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';

import { useMemo } from 'react';

import { Box } from '@mui/material';

const DEFAULT_STYLES: SxProps<Theme> = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 1,
};

interface ListItemProps {
    children?: ReactNode;
    sx?: SxProps<Theme>;
}

export function ListItem({ children, sx }: ListItemProps) {
    const styles = useMemo(
        () => [DEFAULT_STYLES, ...(Array.isArray(sx) ? sx : [sx])],
        [sx]
    );

    return <Box sx={styles}>{children}</Box>;
}
