import { Box, Paper } from '@mui/material';
import lightLogo from 'images/light-horizontal/estuary-logo.png';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

function FullPageDialog({ children }: Props) {
    return (
        <Box
            sx={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                my: 6,
            }}
        >
            <Paper
                sx={{
                    minWidth: 360,
                    maxHeight: 750,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    background:
                        'linear-gradient(159.03deg, rgba(172, 199, 220, 0.18) 2.23%, rgba(172, 199, 220, 0.12) 40.69%)',
                    boxShadow: '0px 4px 24px -1px rgba(0, 0, 0, 0.2)',
                    borderRadius: 5,
                }}
            >
                <img
                    src={lightLogo}
                    style={{ marginBottom: 16 }}
                    width={200}
                    alt="Estuary"
                />

                {children}
            </Paper>
        </Box>
    );
}

export default FullPageDialog;
