import { Box, Paper } from '@mui/material';
import CompanyLogo from 'components/CompanyLogo';
import { darkDialogPaperBackground } from 'context/Theme';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

function FullPageDialog({ children }: Props) {
    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Paper
                sx={{
                    minWidth: 360,
                    maxWidth: 450,
                    maxHeight: 750,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    ...darkDialogPaperBackground,
                }}
            >
                <CompanyLogo />

                {children}
            </Paper>
        </Box>
    );
}

export default FullPageDialog;
