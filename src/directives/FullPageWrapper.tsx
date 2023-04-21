import { Box, Paper, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { paperBackground } from 'context/Theme';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    fullWidth?: boolean;
}

const FullPageWrapper = ({ children, fullWidth }: Props) => {
    const theme = useTheme();
    const aboveMd = useMediaQuery(theme.breakpoints.up('md'));

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
                        maxWidth: fullWidth ? 1180 : 500,
                        width: fullWidth && aboveMd ? '100%' : 'auto',
                        padding: 2,
                        background: paperBackground[theme.palette.mode],
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
