import { Box, Paper, Typography } from '@mui/material';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import lightLogo from '../images/light-horizontal/estuary-logo-light.png';

const NoGrants = () => {
    useBrowserTitle('browserTitle.noGrants');

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

                <Typography sx={{ mb: 5 }}>
                    <FormattedMessage id="noGrants.main.message" />
                </Typography>
            </Paper>
        </Box>
    );
};

export default NoGrants;
