import { Box, Paper } from '@mui/material';
import CompanyLogo from 'components/graphics/CompanyLogo';
import { paperBackground } from 'context/Theme';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    maxWidth?: number;
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
                    background: (theme) => paperBackground[theme.palette.mode],
                }}
            >
                <CompanyLogo />

                {children}
            </Paper>
        </Box>
    );
}

export default FullPageDialog;
