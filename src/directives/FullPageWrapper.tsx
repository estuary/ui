import { Box, Paper, useTheme } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { glassBkgWithoutBlur } from 'context/Theme';
import { BaseComponentProps } from 'types';

const FullPageWrapper = ({ children }: BaseComponentProps) => {
    const theme = useTheme();
    const dialogBackground = glassBkgWithoutBlur[theme.palette.mode];

    return (
        <PageContainer hideBackground>
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Paper
                    sx={{
                        maxWidth: 500,
                        padding: 2,
                        ...dialogBackground,
                    }}
                >
                    {children}
                </Paper>
            </Box>
        </PageContainer>
    );
};

export default FullPageWrapper;
