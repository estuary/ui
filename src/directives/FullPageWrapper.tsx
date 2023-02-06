import { Box, Paper } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { paperBackground } from 'context/Theme';
import { BaseComponentProps } from 'types';

const FullPageWrapper = ({ children }: BaseComponentProps) => {
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
                        background: (theme) =>
                            paperBackground[theme.palette.mode],
                    }}
                >
                    {children}
                </Paper>
            </Box>
        </PageContainer>
    );
};

export default FullPageWrapper;
