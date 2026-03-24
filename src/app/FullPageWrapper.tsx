import type { BaseComponentProps } from 'src/types';

import {
    Box,
    Paper,
    Stack,
    Toolbar,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import AlertBox from 'src/components/shared/AlertBox';
import PageContainer from 'src/components/shared/PageContainer';
import OnLoadSpinner from 'src/context/OnLoadSpinner/OnLoadSpinner';
import { paperBackground } from 'src/context/Theme';

interface Props extends BaseComponentProps {
    fullWidth?: boolean;
    error?: string | null;
}

const FullPageWrapper = ({ children, fullWidth, error }: Props) => {
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
                <Stack spacing={2}>
                    {error ? (
                        <AlertBox severity="error" short>
                            {error}
                        </AlertBox>
                    ) : null}
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
                        <OnLoadSpinner display={false}>
                            {children}
                        </OnLoadSpinner>
                    </Paper>
                </Stack>
            </Box>
        </PageContainer>
    );
};

export default FullPageWrapper;
