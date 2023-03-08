import { Box, Grid, Link } from '@mui/material';
import { semiTransparentBackgroundIntensified } from 'context/Theme';
import { FormattedMessage } from 'react-intl';

interface Props {
    step: number;
    onClick: () => void;
}

function DemoButton({ step, onClick }: Props) {
    return (
        <Grid
            item
            xs={4}
            sx={{
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    bgcolor: (theme) =>
                        semiTransparentBackgroundIntensified[
                            theme.palette.mode
                        ],
                    p: 2,
                    textAlign: 'center',
                    width: '75%',
                    mt: 2,
                }}
            >
                <Link onClick={onClick} sx={{ cursor: 'pointer' }}>
                    <FormattedMessage id={`home.hero.${step}.button`} />
                </Link>
            </Box>
        </Grid>
    );
}

export default DemoButton;
