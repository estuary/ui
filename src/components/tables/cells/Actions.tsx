import { Box, TableCell } from '@mui/material';
import { ReactNode } from 'react';

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
