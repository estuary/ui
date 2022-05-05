import { AppBar, Divider, Paper, Toolbar } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
    header: ReactNode;
    body: ReactNode;
}

function WrapperWithHeader({ header, body }: Props) {
    return (
        <Paper sx={{ width: '100%', mb: 2 }} variant="outlined">
            <AppBar position="relative" elevation={0} color="default">
                <Toolbar
                    variant="dense"
                    sx={{
                        justifyContent: 'space-between',
                    }}
                >
                    {header}
                </Toolbar>
            </AppBar>

            <Divider />
            {body}
        </Paper>
    );
}

export default WrapperWithHeader;
