import { Box, Paper, SxProps } from '@mui/material';
import { paperBackground } from 'src/context/Theme';
import { BaseComponentProps } from 'src/types';

interface Props extends BaseComponentProps {
    paperSx?: SxProps;
}

function FullPageDialog({ children, paperSx }: Props) {
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
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 5,
                    background: (theme) => paperBackground[theme.palette.mode],
                    boxShadow:
                        'rgb(50 50 93 / 2%) 0px 2px 5px -1px, rgb(0 0 0 / 5%) 0px 1px 3px -1px',
                    borderRadius: 3,
                    ...(paperSx ? paperSx : {}),
                }}
            >
                {children}
            </Paper>
        </Box>
    );
}

export default FullPageDialog;
