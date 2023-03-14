import { Box, Paper, Toolbar } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { paperBackground } from 'context/Theme';
import { BaseComponentProps } from 'types';

const FullPageWrapper = ({ children }: BaseComponentProps) => {
    return (
        <PageContainer hideBackground>
            <Toolbar />
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
                        boxShadow:
                            'rgb(50 50 93 / 2%) 0px 2px 5px -1px, rgb(0 0 0 / 5%) 0px 1px 3px -1px',
                        borderRadius: 3,
                    }}
                >
                    {children}
                </Paper>
            </Box>
        </PageContainer>
    );
};

export default FullPageWrapper;
