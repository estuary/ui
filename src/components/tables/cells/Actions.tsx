import { ReactNode } from 'react';

import { Box, TableCell } from '@mui/material';

interface Props {
    children: ReactNode | ReactNode[];
}

function Actions({ children }: Props) {
    return (
        <TableCell>
            <Box
                sx={{
                    display: 'flex',
                }}
            >
                {children}
            </Box>
        </TableCell>
    );
}

export default Actions;
